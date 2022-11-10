<template>
<section :style="`background-image: url('http://167.99.198.188:8055/assets/${Imagen}')`" class="relative bg-right bg-no-repeat bg-cover shadow-md shadow-white/40 md:shadow-white/20">
  <div class="absolute inset-0 bg-gray-50/70 sm:bg-transparent sm:bg-gradient-to-r sm:from-white/90 sm:to-white/30"></div>
  <div :class="Landing ? 'justify-center': ''" class="relative mx-auto max-w-screen-xl px-4 py-32 sm:px-6 lg:flex lg:h-screen lg:items-center lg:px-8 ">
    <div :class="!Landing ? 'sm:text-left': 'mx-auto'" class="max-w-xl text-center lg:max-w-3xl">
      <h1 class="text-xl sm:text-3xl  font-titulo font-bold lg:text-5xl text-gray-600">
        {{Subtitulo}}
        <strong class="block font-titulo font-bold text-orange-600 text-4xl lg:text-7xl lg:mt-3">
          {{Titulo}}
        </strong>
      </h1>

      <div class="mt-4 max-w-lg sm:text-xl sm:leading-relaxed lg:text-2xl lg:max-w-xl font-titulo font-semibold text-gray-600 hidden md:block" v-html="Texto"></div>
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
