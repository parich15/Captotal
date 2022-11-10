<template>
 <div class="p-4 xl:w-3/5 md:w-3/4 w-full mx-auto group">
        <div class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden group-hover:border-orange-500/60 transition">
          <h2 class="text-sm tracking-widest title-font mb-1 font-semibold font-texto text-gray-400 uppercase">{{Titulo}}</h2>
          <h1 class="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200 font-texto">
            <span>{{Precio}}</span>
            <span class="text-xl ml-1 font-normal text-gray-500">€</span>
          </h1>
          <p class="flex items-center mb-2 text-gray-500 group-hover:text-gray-700 font-texto" v-for="Contenido in Contenidos" :key="Contenido.id">
            <span class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400/20 text-white rounded-full flex-shrink-0 group-hover:bg-orange-500 group-hover:animate-pulse transition-all">
              <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" class="w-3 h-3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </span>{{Contenido.Contenido}}
          </p>
          <button class="flex items-center mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded group-hover:scale-105 group-hover:bg-orange-500 transition">Inscribirme ahora
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-auto" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
          <p class="text-xs text-gray-500 mt-3">{{Frase}}</p>
        </div>
      </div>
</template>

<script setup>
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  Titulo: {
    type: String,
    default: 'Titulo Curso'
  },
  Precio:{
    type: String || Number, 
    default: "0"
  },
  Contenidos: {
    type: Array,
    default: []
  },
  Frase:{
    type: String, 
    default: "Frase buena de marketing"
  }
})
</script>
