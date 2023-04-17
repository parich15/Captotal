import VueGtag, { trackRouter } from 'vue-gtag-next'
export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueGtag, {
    property: {
      id: 'G-D9BXMR4TWB'
    },
    isEnabled: true,
  })

  trackRouter(useRouter(),{
    template(to) {
      if(to.name == "Curso-Titulo" ){
        return {
          page_title: to.params.Titulo,
          page_location: to.fullPath,
          page_path: to.path
        };
      }else if(to.name == 'index'){
        return {
          page_title: 'Inicio | Cap Total',
          page_location: to.fullPath,
          page_path: to.path
        };
      }else{
        return{
          page_title: to.name,
          page_location: to.fullPath,
          page_path: to.path
        }
      }
    },
  })
})