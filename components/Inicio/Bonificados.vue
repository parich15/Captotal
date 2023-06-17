<template>
    <section class="container mx-auto w-full bg-gray-50 lg:py-8">
        <div class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <!-- Imagen -->
            <div  class="relative  overflow-hidden rounded-lg h-80 lg:h-full shadow-2xl ">
                <img
                height="575"
                width="400"
                :alt="props.Alt"
                :src="`https://admin.captotal.com/assets/${Imagen}`"
                class="absolute inset-0 h-full w-full object-cover object-left"
                />
            </div>

            <!-- Texto -->
            <div :class="Orden ? 'row-start-1' : ''" class="lg:py-24">
                <h2 class="text-4xl font-bold sm:text-5xl font-titulo text-gray-700">{{Titulo}}</h2>
                <h4 class="font-texto font-semibold text-orange-500 animate-pulse">{{Subtitulo}}</h4>

                <div class="mt-4 text-gray-500 font-texto text-lg max-h-64 overflow-hidden" v-html="Descripcion"></div>

                <a href="tel:+34930107462"
                class="mt-9 boton-outline font-texto font-semibold text-lg md:hidden">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5 mr-3">
                 <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                </svg>
                <span> Contacta con nosotros </span>
                </a>
                <NuxtLink
                to="/Nosotros"
                class="mt-9 boton-outline font-titulo font-semibold text-lg hidden md:inline-flex"
                >
                <span> Contacta con nosotros </span>
                </NuxtLink>
            </div>
        </div>
    </div>
</section>    
</template>

<script setup>
const props = defineProps({
    Titulo: {
        type: String || undefined,
        default: "Cursos Bonificados"
    },
    Alt: String,
    Subtitulo:{
        type: String,
        default: ''
    },
    Descripcion: {
        type: String,
        default: 'Descripción de los cursos:'
    },
    Imagen: {
        type: String,
    },
    Orden: {
        type: Boolean,
        default: false
    }
})
</script>

