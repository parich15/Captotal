<template>
    <section class="container mx-auto pt-10 pb-20">
        <div class="mx-5 flex items-center flex-col md:flex-row">
            <div class="m-3 md:w-1/2 lg:w-3/5 mb-10 lg:mb-0">
                <h3 class="font-titulo text-4xl text-gray-700 font-bold">{{datos.Contenido[0].Content[0].item.Titulo}}</h3>
                <h5 class="font-texto font-bold text-gray-500 mb-1 ml-1">{{datos.Contenido[0].Content[1].item.Titulo}}</h5>
                <div class="h-1 w-16 bg-orange-400 rounded mb-6"></div>
                <div class="font-texto text-gray-700 text-lg" v-html="datos.Contenido[0].Content[2].item.Texto">
                    
                </div>
            </div>
            <div class="flex-grow">
                <img width="320" height="320" :src="'http://167.99.198.188:8055/assets/'+ datos.Contenido[0].Content[3].item.Imagen" alt="Curso Bonificado" class='max-h-56 mx-auto object-cover shadow-lg rounded'>
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
