export const prerender = false;

// Extrae la IP real del cliente cuando la app corre detrás de un reverse proxy
// (Nginx). X-Forwarded-For puede contener una lista "cliente, proxy1, proxy2";
// el primer valor es el cliente original.
function getClientIp(request, clientAddress) {
    const forwardedFor = request.headers.get("x-forwarded-for");
    if (forwardedFor) {
        return forwardedFor.split(",")[0].trim();
    }

    const realIp = request.headers.get("x-real-ip");
    if (realIp) {
        return realIp.trim();
    }

    return clientAddress ?? null;
}

export const POST = async ({ request, clientAddress }) => {
    try {
        const body = await request.json();
        const { eventName, eventId, url, customData, fbp, fbc } = body;

        // Se lee en runtime (process.env) con fallback al valor inlineado en build.
        // Las variables PUBLIC_ se incrustan en el bundle durante `pnpm build`: si el
        // .env no existía en ese momento, quedarían como `undefined` para siempre.
        // Leerlas del proceso permite que PM2 las inyecte sin depender del build.
        const pixelId = process.env.PUBLIC_PIXEL_ID || import.meta.env.PUBLIC_PIXEL_ID;
        const accessToken = process.env.META_ACCESS_TOKEN;

        if (!pixelId || !accessToken) {
            console.error("CAPI: faltan PUBLIC_PIXEL_ID o META_ACCESS_TOKEN en el entorno");
            return new Response(JSON.stringify({ success: false }), { status: 500 });
        }

        if (!eventName) {
            return new Response(JSON.stringify({ success: false }), { status: 400 });
        }

        const clientIp = getClientIp(request, clientAddress);
        const clientUserAgent = request.headers.get("user-agent");

        // _fbp y _fbc elevan la calidad de coincidencia (EMQ) y refuerzan la
        // deduplicación con el Pixel. Solo se incluyen si el cliente los envía.
        const userData = {
            client_ip_address: clientIp,
            client_user_agent: clientUserAgent,
        };
        if (fbp) userData.fbp = fbp;
        if (fbc) userData.fbc = fbc;

        const metaPayload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,
                event_source_url: url,
                action_source: "website",
                user_data: userData,
                ...(customData && { custom_data: customData }),
            }],
        };

        const metaResponse = await fetch(
            `https://graph.facebook.com/v21.0/${pixelId}/events?access_token=${accessToken}`,
            {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(metaPayload),
            },
        );

        if (!metaResponse.ok) {
            const errorBody = await metaResponse.text();
            console.error(`CAPI: Graph API respondió ${metaResponse.status}:`, errorBody);
            return new Response(JSON.stringify({ success: false }), { status: 502 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        console.error("Error en CAPI:", e);
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
};
