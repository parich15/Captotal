<template>
    <section>
        <div class="mx-auto py-10 bg-gray-900">
            <!-- Texto Fondo -->
            <div class="mx-4 relative ">
            <p 
            class=" w-full absolute z--1 top-10 sm:top-32 font-titulo text-7xl font-bold texto-gradiente bg-gradient-to-r from-orange-400 to via-orange-500 bg-orange-600 leading-30 opacity-5 lg:top-36 lg:text-8xl lg:flex lg:flex-col">
                Garantiza tu aprobado.
                <br>
                <span class="lg:ml-auto">
                    La mejor formación está aquí.
                </span>
            </p>
                
            </div>

            <!-- Texto Principal -->
            <div class=" flex flex-col font-texto font-semibold text-white mt-6 container py-20 px-3 md:max-w-xl md:mx-auto font-lg justify-center sm:mt-0 lg:max-w-3xl lg:text-lg ">
            <h3 class="text-white font-titulo font-bold text-right lg:text-left lg:text-3xl lg:mb-3">{{ titulo }}</h3>
            <div class="h-1 w-16 bg-orange-500 rounded ml-auto mb-3 lg:ml-0 lg:w-20 "></div>
                <div class="sm:mt-8 lg:text-xl" v-html="texto">
                </div>
            </div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    titulo: {
        type: String,
        required: true,
        default: "Cursos y Permisos en Barcelona"
    },
    texto: {
        type: String,
        required: true, 
        default: "Lorem Ipsum"
    }
})
</script>
