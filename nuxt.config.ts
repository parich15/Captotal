// https://nuxt.com/docs/api/configuration/nuxt-config
const GTM_ID = 'GTM-KXG3CPPH'
const FONTS_URL = 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&family=Nunito:wght@300;400;600;800&display=swap'

// Google Tag Manager condicionado al banner de cookies: solo se carga si el usuario ya ha aceptado
// (localStorage 'cookiesAceptadas'). Al aceptar, el banner llama a window.cargarGTM() sin recargar.
// Sin noscript a propósito: sin JS no se puede aceptar el banner, así que nunca habría consentimiento.
const GTM_SCRIPT = `(function(w,d){var cargado=false;w.cargarGTM=function(){if(cargado)return;cargado=true;
(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(w,d,'script','dataLayer','${GTM_ID}');};
try{if(w.localStorage.getItem('cookiesAceptadas')==='true')w.cargarGTM();}catch(e){}})(window,document);`

export default defineNuxtConfig({
    compatibilityDate: '2026-10-05',

    //App Config
    app: {
        head:{
            viewport: 'width=device-width, initial-scale=1, maximum-scale=5',
            charset: 'utf-8',
            htmlAttrs:{
                lang: "es-ES"
            },
            //Meta Etiquetas
            meta: [
                { name: 'theme-color', content: '#f97316' },
                { name: 'seobility', content: '2303551818a68f4dbf5b1c078ae65f84' },
                { property: 'og:url', content: 'https://captotal.com' },
                { property: 'og:type', content: 'website' },
                { property: 'og:site_name', content: 'Captotal' }
            ],
            //Scripts
            script: [
                // Google Tag Manager lo más arriba posible del <head>: prioridad 15 = justo tras charset, viewport y title
                { key: 'gtm', textContent: GTM_SCRIPT, tagPriority: 15 },
                {
                    src: `https://js.clickrank.ai/seo/850e6014-7556-4ad9-84af-491e3d95295b/script?${new Date().getTime()}`,
                    async: true,
                }
            ],
            //Link
            link: [
                { rel: 'icon', type: 'image/png', href: "/favicon.png" },
                { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
                { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
                { rel: 'preload', as: 'style', onload: "this.onload=null;this.rel='stylesheet'", href: FONTS_URL }
            ],
            noscript: [
                { key: 'fonts', innerHTML: `<link rel="stylesheet" href="${FONTS_URL}">` }
            ]
        }
    },
    //CSS
    css: [
        'vue3-carousel/dist/carousel.css'
    ],

    //Modulos
    modules: ['@nuxtjs/tailwindcss', 'nuxt-directus', '@nuxtjs/sitemap'],

    //Tailwind Options
    tailwindcss: {
        cssPath: '~/assets/css/main.css',
        configPath: 'tailwind.config.js',
        exposeConfig: false,
        viewer: false
    },

    //Directus
    directus: {
        url: 'https://admin.captotal.com',
    },

    // Api y Env. Lo que está fuera de `public` solo existe en el servidor (se puede sobrescribir con NUXT_*, p.ej. NUXT_DIRECTUS_TOKEN)
    runtimeConfig:{
        directusUrl: 'https://admin.captotal.com',
        directusToken: process.env.NOTIFICATION_TOKEN,
        redsys: {
            secreto: 'TIVfhTviJ1b5sNRU/qMorrf+w56fpu5V',
            comercio: '358281368',
            terminal: '1',
        },
        // 'flexible': si Redsys no manda respuesta firmada, el alumno se da de alta al llegar a la confirmación (como antes).
        // 'estricta': solo con la notificación online o la respuesta firmada en la URLOK.
        pagoVerificacion: 'flexible',
        pagosDir: '.data/pagos',
        public:{
            siteUrl: process.env.BASE_URL || 'https://captotal.com',
        }
    },
    //Server
    nitro: {
        compressPublicAssets: true,
        // desplegar.sh compila en otra carpeta mientras la web sigue sirviendo la build actual
        ...(process.env.NITRO_OUTPUT_DIR && { output: { dir: process.env.NITRO_OUTPUT_DIR } })
    },

    //Sitemap -- Los cursos y posts se cargan en tiempo real desde Directus (server/api/__sitemap__/urls.ts)
    site: {
        url: process.env.BASE_URL || 'https://captotal.com',
    },
    sitemap: {
        exclude: ['/Checkout', '/Pago/**'],
        sources: ['/api/__sitemap__/urls']
    }
})
