// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
    //App Config
    app: {
        head:{
            htmlAttrs:{
                lang: "es"
            },
            //Meta Etiquetas
            meta: [
                {name: 'theme-color', content: '#f97316'}
            ],
            //Scripts
            script: [],
            //Link
            link: [
                {rel: 'preconnect', href: 'https://fonts.googleapis.com'},
                {rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: true},
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

    // Server Config
    buildModules: ['@averjs/nuxt-compression']
})
