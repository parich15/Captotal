// Página vista para GTM en la carga inicial y en cada navegación (la web es una SPA)
export default defineNuxtPlugin((nuxtApp) => {
  const { enviarPaginaVista } = useDataLayer()
  nuxtApp.hook('page:finish', () => {
    // unhead actualiza el <title> justo después de pintar la página
    setTimeout(enviarPaginaVista, 50)
  })
})
