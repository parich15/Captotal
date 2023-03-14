<template>
    <div class="contenido">
      <h3 class="font-titulo text-4xl font-bold text-gray-700 mb-3">{{Titulo}}</h3>
      <div class="h-1 w-16 bg-orange-400 rounded mb-6"></div>
      <h4 class="font-texto text-orange-400 font-semibold tracking-wide text-lg mb-1">{{Subtitulo}}</h4>
      <div class="font-texto text-lg text-justify text-gray-700" v-html="Contenido"></div>
    </div>
</template>

<script setup>
defineProps({
  Titulo: {
    type: String,
    default: ""
  },
  Subtitulo: {
    type: String
  },
  Contenido: {
    type: String || null
  }
})
</script>
