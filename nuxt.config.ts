// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
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
                {
                    name: 'theme-color', 
                    content: '#f97316'
                },
                {
                    name: 'seobility',
                    content: '2303551818a68f4dbf5b1c078ae65f84'
                },
                {
                    hid: 'og:url',
                    name: 'og:url',
                    content: 'https://captotal.com'
                  },
                  {
                    hid: 'og:type',
                    name: 'og:type',
                    content: 'website'
                  },
                  {
                    hid: 'og:site_name',
                    name: 'og:site_name',
                    content: 'Captotal'
                  }
            ],
            //Scripts
            script: [],
            //Link
            link: [
                {rel: 'icon', type: 'image/png', href: "/favicon.png"},
                {rel: 'preload', as:'style', onload:"this.onload=null;this.rel='stylesheet'", href: 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&family=Nunito:wght@300;400;600;800&display=swap'}
            ],
            noscript: [
                {
                    hid: 'Fonts',
                    innerHTML: '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&family=Nunito:wght@300;400;600;800&display=swap">'
                }
            ],            
            //Css
            style:[]
        }
    },
    //CSS
    css: [
        'vue3-carousel/dist/carousel.css'
    ],
    
    //Modulos
    modules: ['@nuxtjs/tailwindcss','nuxt-directus','nuxt-simple-sitemap'],
    

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

    // Api y Env
    runtimeConfig:{
        public:{
            notifications: process.env.NOTIFICATION_TOKEN,
            siteUrl: process.env.BASE_URL || 'https://captotal.com',
        }
    },
    //Server
    nitro: {
        compressPublicAssets: true
    },

    //Sitemap -- Cargamos todos los cursos que hay y eliminamos los espacios para dejarlos identicos a la Url
    sitemap:{
        urls: async () => {
            const cursos = await fetch('https://admin.captotal.com/items/Cursos?fields=id,Titulo,Slug').then(res => res.json());
            return cursos.data.map((pagina: any) => ({
                url: `/Curso/${pagina.Slug}`,
            }));
        }
    }
})
