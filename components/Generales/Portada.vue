<template>
<section :style="`background-image: url('https://admin.captotal.com/assets/${Imagen}')`" class="relative bg-right bg-no-repeat bg-cover shadow-md shadow-white/40 md:shadow-white/20">
  <div class="absolute inset-0 bg-gray-50/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/90 sm:to-white/30"></div>
  <div :class="Landing ? 'justify-center': ''" class="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8 ">
    <div :class="!Landing ? 'sm:text-left': 'mx-auto'" class="max-w-xl text-center lg:max-w-3xl">
  <p v-if="Subtitulo" class="text-xl sm:text-3xl font-titulo font-semibold text-gray-600">
  {{ Subtitulo }}
</p>
<h1 class="font-titulo font-bold text-orange-600 text-4xl lg:text-7xl mt-2">
  {{ Titulo }}
</h1>

      <div :class="Landing ? 'justify-center mx-auto' : ''" class="mt-4 max-w-lg sm:text-xl sm:leading-relaxed md:text-lg lg:text-xl xl:text-2xl lg:max-w-2xl font-titulo font-semibold text-gray-600 hidden md:flex" v-html="Texto"></div>
    </div>
  </div>
</section>
</template>

<script setup>
defineProps({
    Imagen: {
        type: String,
        required: true
    },
    Titulo: {
        type: String,
        required: true
    },
    Subtitulo: {
        type: String,
        default: 'Formación Vial Profesional'
    },
    Texto: String,
    Landing: {
      type: Boolean,
      required: true,
      default: false
    },
})
</script>
