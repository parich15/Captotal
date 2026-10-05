// Eventos para Google Tag Manager, la única fuente de datos para GA4 y Google Ads (se configuran en GTM).
// Solo se envían si el usuario ha aceptado las cookies: sin consentimiento GTM no se carga y no se guarda nada.
const hayConsentimiento = () => {
    try {
        return localStorage.getItem('cookiesAceptadas') === 'true';
    } catch (e) {
        return false;
    }
}

export const useDataLayer = () => {
    const enviar = (datos) => {
        if (import.meta.server || !hayConsentimiento()) return;
        window.dataLayer = window.dataLayer || [];
        window.dataLayer.push(datos);
    }

    // Comercio electrónico de GA4: se vacía el objeto ecommerce anterior antes de cada evento (recomendación de Google)
    const enviarEcommerce = (event, ecommerce) => {
        enviar({ ecommerce: null });
        enviar({ event, ecommerce: { currency: 'EUR', ...ecommerce } });
    }

    // Página vista "virtual" (la web es una SPA): se envía cuando Nuxt ya ha pintado la página y cambiado el título
    const enviarPaginaVista = () => enviar({
        event: 'virtual_page_view',
        page_location: window.location.href,
        page_path: window.location.pathname + window.location.search,
        page_title: document.title,
    });

    const itemCurso = ({ id, Titulo, Tipo, Precio }) => ({
        item_id: `curso_${id}`,
        item_name: Titulo,
        item_category: Tipo,
        price: Number(Precio),
        quantity: 1,
    });

    return { enviar, enviarEcommerce, enviarPaginaVista, itemCurso };
}
