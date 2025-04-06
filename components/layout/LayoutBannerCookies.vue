<template>
    <ClientOnly>
        <div id="bannerCookie" class=" w-full fixed bottom-5 z-[9999]" v-if="mostrar">
            <div class="p-3 w-10/12 lg:w-6/12 mx-auto bg-orange-500/80 rounded-lg">
                <div class="texto text-justify font-texto font-semibold text-white text-xs" v-html="data.Contenido[0].Content[0].item.Texto"></div>
                <div class="flex justify-center mt-2 md:justify-around align-middle">
                    <button @click="cerrarBanner" class="bg-white rounded-lg py-1 px-2 font-titulo font-semibold w-full hover:text-orange-400 hover:scale-95 transition-all md:w-1/2">Continuar navegando</button>
                    <div class="hidden md:block w-1/2 text-center hover:scale-95 transition">
                        <NuxtLink to="/politica-de-cookies" class=" font-titulo font-semibold text-lg text-white ">Ver Politica de Cookies</NuxtLink>
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

const cerrarBanner = () => {
    mostrar.value = !mostrar.value;
    localStorage.setItem('bannerCookies',mostrar.value);
}

onMounted(()=>{
    let estado = localStorage.getItem('bannerCookies');
    if(estado === 'false'){
        mostrar.value = false;
    }
})
</script>
<style>
#bannerCookie .texto > * > a{
font-weight: bold;
}
</style>