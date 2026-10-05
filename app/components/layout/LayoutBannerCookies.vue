<template>
    <ClientOnly>
        <div id="bannerCookie" class=" w-full fixed bottom-5 z-[9999]" v-if="mostrar">
            <div class="p-3 w-10/12 lg:w-6/12 mx-auto bg-orange-500/80 rounded-lg">
                <div class="texto text-justify font-texto font-semibold text-white text-xs" v-html="data.Contenido[0].Content[0].item.Texto"></div>
                <div class="flex flex-col md:flex-row gap-2 mt-4">
                    <div class="flex gap-2 w-full md:w-2/3">
                        <button @click="aceptarCookies" class="bg-white rounded-lg py-2 px-4 font-titulo font-semibold w-1/2 hover:text-orange-400 hover:scale-95 transition-all">Aceptar</button>
                        <button @click="rechazarCookies" class="bg-gray-700 text-white rounded-lg py-2 px-4 font-titulo font-semibold w-1/2 hover:bg-gray-800 hover:scale-95 transition-all">Rechazar</button>
                    </div>
                    <div class="w-full md:w-1/3 text-center">
                        <NuxtLink to="/politica-de-cookies" class="font-titulo font-semibold text-white hover:underline">Ver Política de Cookies</NuxtLink>
                    </div>
                </div>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
import { usePageData } from '~/composables/usePageData';

const {getBloquesSections} = usePageData()
const data = await getBloquesSections(3);

const mostrar = ref(true);
const { enviarPaginaVista } = useDataLayer();

const aceptarCookies = () => {
    mostrar.value = false;
    localStorage.setItem('cookiesAceptadas', 'true');
    // Cargamos Google Tag Manager (definido en nuxt.config) sin recargar y registramos la página actual
    window.cargarGTM?.();
    enviarPaginaVista();
}

const rechazarCookies = () => {
    mostrar.value = false;
    localStorage.setItem('cookiesAceptadas', 'false');
}

// Si ya hay una decisión guardada no mostramos el banner (GTM ya arranca solo si se aceptó)
onMounted(() => {
    if (['true', 'false'].includes(localStorage.getItem('cookiesAceptadas'))) {
        mostrar.value = false;
    }
})
</script>
<style>
#bannerCookie .texto > * > a{
font-weight: bold;
}
</style>
