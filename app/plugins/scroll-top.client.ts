export default defineNuxtPlugin((nuxtApp) => {
    nuxtApp.hook("page:finish", async (a) => {
      setTimeout(()=>{
        window.scrollTo({ top: 0 });
      },300)
    });
  });