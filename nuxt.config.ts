// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    //App Config
    app: {
        head:{
            viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
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
                    hid: 'robots',
                    name: 'robots',
                    content: 'index, follow'
                },
                {
                    hid: 'googlebot',
                    name: 'googlebot',
                    content: 'index, follow'
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
                {rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=League+Spartan:wght@400;700&family=Nunito:wght@300;400;600;800&display=swap'}
            ],
            //Css
            style:[]
        }
    },
    //Loading
    loading:{
        color: '#f97316',
        height: '3px'
    },

    css: [
        'vue3-carousel/dist/carousel.css'
    ],

    //Modulos
    modules: ['@nuxtjs/tailwindcss', 'nuxt-directus'],

    //Tailwind Options
    tailwindcss: {
        cssPath: '~/assets/css/main.css',
        configPath: 'tailwind.config.js',
        exposeConfig: false
    },

    //Directus
    directus: {
        url: 'http://167.99.198.188:8055/',
    },

    // Api y Env
    runtimeConfig:{
        public:{
            adminToken: process.env.ADMIN_TOKEN,
        }
    }
})
