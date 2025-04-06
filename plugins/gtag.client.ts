import VueGtag, { trackRouter } from 'vue-gtag-next'
export default defineNuxtPlugin((nuxtApp) => {
  let cookiesAceptadas;
  
  // Verificar si estamos en el lado del cliente
  if (process.client) {
    cookiesAceptadas = localStorage.getItem('cookiesAceptadas');
  }

  // Configurar Google Analytics
  const config = {
    property: {
      id: 'G-D9BXMR4TWB'
    },
    isEnabled: cookiesAceptadas === 'true',
    bootstrap: cookiesAceptadas === 'true',
    config: {
      cookie_flags: 'SameSite=None;Secure'
    }
  };

  // Inicializar Vue Gtag
  nuxtApp.vueApp.use(VueGtag, config);

  trackRouter(useRouter(),{
    template(to) {
      if(to.name == "Curso-slug" ){
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
