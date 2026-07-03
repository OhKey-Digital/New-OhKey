// Tracking de META (Pixel + Conversions API) con deduplicación por eventID.
//
// Se carga UNA sola vez desde el Layout y usa delegación de eventos sobre
// document, de modo que da igual cuántos botones .btn haya en la página: un
// único listener los cubre todos y cada clic dispara exactamente un evento.

declare global {
    interface Window {
        fbq?: (...args: unknown[]) => void;
    }
}

// Lee una cookie por nombre; devuelve null si no existe.
function getCookie(name: string): string | null {
    const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
    return match ? decodeURIComponent(match[1]) : null;
}

// Deriva el parámetro fbc a partir de ?fbclid= cuando la cookie _fbc aún no
// existe (primer pageview tras un clic de anuncio). Formato oficial de Meta:
// fb.1.<timestamp_ms>.<fbclid>
function getFbc(): string | null {
    const cookieFbc = getCookie("_fbc");
    if (cookieFbc) return cookieFbc;

    const fbclid = new URLSearchParams(window.location.search).get("fbclid");
    if (fbclid) return `fb.1.${Date.now()}.${fbclid}`;

    return null;
}

function trackContact(): void {
    // event_id compartido entre Pixel y CAPI: es la clave de deduplicación.
    const eventId = crypto.randomUUID();
    const url = window.location.href;
    const customData = { content_name: "Contacto WhatsApp" };

    if (typeof window.fbq !== "undefined") {
        window.fbq("track", "Contact", customData, { eventID: eventId });
    }

    // No bloqueamos la navegación del enlace: fetch en segundo plano.
    fetch("/api/track", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            eventName: "Contact",
            eventId,
            url,
            customData,
            fbp: getCookie("_fbp"),
            fbc: getFbc(),
        }),
        keepalive: true,
    }).catch((e) => console.error("Error en CAPI:", e));
}

// Delegación: un único listener para todos los botones .btn presentes y futuros.
document.addEventListener("click", (event) => {
    const target = event.target as HTMLElement | null;
    if (target?.closest(".btn")) {
        trackContact();
    }
});

export {};
