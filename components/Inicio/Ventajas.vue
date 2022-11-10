<template>
    <section class="text-white bg-gray-900">
    <div class="mx-auto max-w-screen-xl px-4 py-16 lg:py-14 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-lg text-center">
        <h2 class="texto-gradiente pb-6 text-5xl font-bold sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-500 font-titulo lg:text-6xl xl:text-7xl">{{Titulo}}</h2>

        <div class="mt-4 text-gray-200 font-texto font-semibold text-base xl:text-xl" v-html="Descripcion">
           
        </div>
        </div>

        <div class="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <a v-for="i in 6" :key="i"
            class="block rounded-xl border border-gray-800 p-8 shadow-xl  hover:border-orange-500/10 hover:shadow-orange-500/10 transition duration-200 transform hover:scale-110 ease-in-out"
        >
            <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-10 w-10 text-orange-500"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            >
            <path d="M12 14l9-5-9-5-9 5 9 5z" />
            <path
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
            />
            <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
            />
            </svg>

            <h3 class="mt-4 text-xl font-bold text-white font-texto mb-2">Lorem ipsum</h3>

            <p class="mt-1 text-sm text-gray-300 md:text-base font-texto font-semibold lg:text-lg lg:font-semibold">
            Lorem ipsum dolor sit, amet consectetur adipisicing elit. Labore itaque sunt molestias harum quia, ut alias, facilis nihil debitis voluptas eos earum fugiat saepe. Qui ab nulla culpa dolorem accusamus?
            </p>
        </a>

       
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
defineProps({
    Titulo: String,
    Descripcion: String
})
</script>

