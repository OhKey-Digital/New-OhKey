export const prerender = false;

export const POST = async ({ request }) => {
    try {
        const body = await request.json();
        const { eventName, eventId, url, userAgent } = body;

        const pixelId = import.meta.env.PUBLIC_PIXEL_ID;
        const accessToken = import.meta.env.META_ACCESS_TOKEN;

        const metaPayload = {
            data: [{
                event_name: eventName,
                event_time: Math.floor(Date.now() / 1000),
                event_id: eventId,
                event_source_url: url,
                action_source: "website",
                user_data: { client_user_agent: userAgent }
            }]
        };

        await fetch(`https://graph.facebook.com/v19.0/${pixelId}/events?access_token=${accessToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(metaPayload),
        });

        return new Response(JSON.stringify({ success: true }), { status: 200 });
    } catch (e) {
        return new Response(JSON.stringify({ success: false }), { status: 500 });
    }
};