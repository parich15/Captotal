<template>
    <section class="text-white bg-gray-900">
    <div class="mx-auto max-w-screen-xl px-4 py-16 lg:py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-lg text-center">
        <h2 class="texto-gradiente pb-6 text-5xl font-bold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 font-titulo lg:text-6xl xl:text-7xl">{{Titulo}}</h2>

        <div class="mt-4 text-gray-200 font-texto font-semibold text-base xl:text-xl" v-html="Descripcion">
           
        </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <div v-for="ventaja in ventajas" :key="ventaja"
            class="block rounded-xl border border-gray-800 p-8 shadow-xl  hover:border-orange-500/10 hover:shadow-orange-500/10 transition duration-200 transform hover:scale-110 ease-in-out"
        >
            <div v-html="ventaja.Imagen"></div>

            <h3 class="mt-4 text-xl font-bold text-white font-texto mb-2">{{ventaja.Titulo}}</h3>

            <p class="mt-1 text-sm text-gray-300 md:text-base font-texto font-semibold lg:text-lg lg:font-semibold">
                {{ventaja.Descripcion}}
            </p>
        </div>

       
        </div>

        <div class="mt-12 text-center">
        <NuxtLink to="/Nosotros"
            class="boton-primario transform scale-100 hover:scale-105 hover:shadow-md transition-all font-texto font-semibold w-60 mx-auto" 
            
        >
             Sobre Nosotros
        </NuxtLink>
        </div>
    </div>
</section>

</template>

<script setup>
import { useVentajas } from '~~/composables/useVentajas';
const {ventajas, getVentajas} = useVentajas();
defineProps({
    Titulo: String,
    Descripcion: String
})

await getVentajas();
</script>

