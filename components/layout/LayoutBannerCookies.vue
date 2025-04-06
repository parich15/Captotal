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
import { useGtag } from 'vue-gtag-next';

const {getBloquesSections} = usePageData()
const data = await getBloquesSections(3);

const mostrar = ref(true);
const gtag = useGtag();

const aceptarCookies = () => {
    mostrar.value = false;
    localStorage.setItem('cookiesAceptadas', 'true');
    // Intentamos habilitar Google Analytics si está disponible
    try {
        if (gtag && gtag.isEnabled) {
            gtag.isEnabled.value = true;
        }
        // Recargamos la página para asegurar que GA se cargue correctamente
        window.location.reload();
    } catch (error) {
        console.error('Error al habilitar Google Analytics:', error);
    }
}

const rechazarCookies = () => {
    mostrar.value = false;
    localStorage.setItem('cookiesAceptadas', 'false');
    // Intentamos deshabilitar Google Analytics si está disponible
    try {
        if (gtag && gtag.isEnabled) {
            gtag.isEnabled.value = false;
        }
    } catch (error) {
        console.error('Error al deshabilitar Google Analytics:', error);
    }
}

onMounted(() => {
    const cookiesAceptadas = localStorage.getItem('cookiesAceptadas');
    if (cookiesAceptadas === 'true') {
        mostrar.value = false;
        try {
            if (gtag && gtag.isEnabled) {
                gtag.isEnabled.value = true;
            }
        } catch (error) {
            console.error('Error al habilitar Google Analytics:', error);
        }
    } else if (cookiesAceptadas === 'false') {
        mostrar.value = false;
        try {
            if (gtag && gtag.isEnabled) {
                gtag.isEnabled.value = false;
            }
        } catch (error) {
            console.error('Error al deshabilitar Google Analytics:', error);
        }
    }
})
</script>
<style>
#bannerCookie .texto > * > a{
font-weight: bold;
}
</style>
