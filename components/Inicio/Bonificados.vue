<template>
    <section class="container mx-auto w-full bg-gray-50 lg:mt-28">
        <div class="mx-auto max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8">
        <div class="grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-16">
            <!-- Imagen -->
            <div class="relative h-64 overflow-hidden rounded-lg sm:h-80 lg:h-full shadow-2xl">
                <img
                height="575"
                width="400"
                alt="Cursos CAP Inicial y CAP Continuo Bonificados"
                :src="`http://167.99.198.188:8055/assets/${Imagen}`"
                class="absolute inset-0 h-full w-full object-cover object-left"
                />
            </div>

            <!-- Texto -->
            <div class="lg:py-24">
                <h2 class="text-4xl font-bold sm:text-5xl font-titulo text-gray-700">{{Titulo}}</h2>
                <h4 class="font-texto font-semibold text-orange-500 animate-pulse">{{Subtitulo}}</h4>

                <div class="mt-4 text-gray-500 font-texto text-lg max-h-64 overflow-hidden " v-html="Descripcion"></div>

                <a
                href="#"
                class="mt-9 boton-outline font-texto font-semibold text-lg "
                >
                <span> Saber más </span>

                <svg
                    class="ml-3 h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                </svg>
                </a>
            </div>
        </div>
    </div>
</section>    
</template>

<script setup>
defineProps({
    Titulo: {
        type: String || undefined,
        default: "Cursos Bonificados"
    },
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
    }
})
</script>

