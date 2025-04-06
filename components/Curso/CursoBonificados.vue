<template>
    <section class="container mx-auto pt-10 pb-20">
        <div class="mx-5 flex items-center flex-col md:flex-row">
            <div class="m-3 md:w-1/2 lg:w-3/5 mb-10 lg:mb-0">
                <h2 class="font-titulo text-4xl text-gray-700 font-bold">{{datos.Contenido[0].Content[0].item.Titulo}}</h2>
                <h3 class="font-texto font-bold text-gray-500 mb-1 ml-1">{{datos.Contenido[0].Content[1].item.Titulo}}</h3>
                <div class="h-1 w-16 bg-orange-400 rounded mb-6"></div>
                <div class="font-texto text-gray-700 text-lg" v-html="datos.Contenido[0].Content[2].item.Texto">
                </div>
                <div>
                    <a href="tel:+34930107462"
                class="mt-9 boton-outline font-texto font-semibold text-lg md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span> Contacta con nosotros </span>
                </a>
                <NuxtLink
                :to="{name:'Nosotros', hash: '#contacto'}"
                class="mt-3 boton-outline font-titulo font-semibold text-lg hidden md:inline-flex"
                >
                <span> Contacta con nosotros </span>
                </NuxtLink>
            
                </div>
                
            </div>
            <div class="flex-grow">
                <img loading="lazy" width="320" height="320" :src="'https://admin.captotal.com/assets/'+ datos.Contenido[0].Content[3].item.Imagen" alt="Curso Bonificado" class='max-h-56 mx-auto object-cover shadow-lg rounded'>
            </div>
        </div>
    </section>
</template>

<script setup>
import { usePageData } from '~~/composables/usePageData';
const { getBloquesSections} = usePageData();
const datos = ref(null);
datos.value = await getBloquesSections(1)
</script>
