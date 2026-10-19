export const actualizarConsentimientoGoogle = (aceptadas) => {
    const estado = aceptadas ? 'granted' : 'denied';
    window.dataLayer = window.dataLayer || [];
    // Consent Mode usa la misma forma de llamada que gtag, incluso si GTM lo carga después.
    function consentimiento() { window.dataLayer.push(arguments); }
    consentimiento('consent', 'update', {
        analytics_storage: estado,
        ad_storage: estado,
        ad_user_data: estado,
        ad_personalization: estado,
    });
};

export const eliminarCookiesAnaliticas = () => {
    const nombres = document.cookie.split(';').map(cookie => cookie.split('=')[0].trim())
        .filter(nombre => /^(_ga(?:_|$)|_gid$|_gat(?:_|$)|_gcl_|_gac_|AMP_TOKEN$)/.test(nombre));
    const partes = window.location.hostname.split('.');
    const dominios = ['', ...partes.map((_, indice) => partes.slice(indice).join('.')).filter(dominio => dominio.includes('.'))];
    const segmentos = window.location.pathname.split('/').filter(Boolean);
    const rutas = ['/', ...segmentos.map((_, indice) => '/' + segmentos.slice(0, indice + 1).join('/'))];
    for (const nombre of nombres) for (const dominio of dominios) for (const ruta of rutas) {
        const base = `${nombre}=; Max-Age=0; path=${ruta}; SameSite=Lax`;
        document.cookie = base + (dominio ? `; domain=${dominio}` : '');
        if (dominio) document.cookie = base + `; domain=.${dominio}`;
    }
};
