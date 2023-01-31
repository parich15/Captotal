<template>
    <section class="text-gray-600 container mx-auto">
    <div class="lg:w-5/6  px-5 pt-24 pb-16 mx-auto">
    <div class="flex flex-col text-center w-full mb-20">
      <h2 class="text-xs text-orange-500 tracking-widest font-medium title-font mb-1">CENTRO FORMATIVO CAP TOTAL</h2>
      <h1 class="sm:text-3xl text-2xl font-medium font-titulo mt-2 mb-4 text-gray-900">Expertos en formación vial profesional</h1>
      <div class="lg:w-2/3 mx-auto leading-relaxed text-base font-texto" v-html="textoPrincipal"></div>
    </div>
    <div class="flex flex-wrap">
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-700 font-semibold  title-font mb-2 font-titulo">{{col1Tit}}</h2>
        <div class="leading-relaxed text-base mb-4" v-html="col1Txt"></div>           
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-700 font-semibold  title-font mb-2 font-titulo">{{col2Tit}}</h2>
        <div class="leading-relaxed text-base mb-4" v-html="col2Txt"></div>           
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-700 font-semibold  title-font mb-2 font-titulo">{{ col3Tit }}</h2>
        <div class="leading-relaxed text-base mb-4" v-html="col3Txt"></div>           
      </div>
      <div class="xl:w-1/4 lg:w-1/2 md:w-full px-8 py-6 border-l-2 border-gray-200 border-opacity-60">
        <h2 class="text-lg sm:text-xl text-gray-700 font-semibold  title-font mb-2 font-titulo">{{col4Tit}}</h2>
        <div class="leading-relaxed text-base mb-4" v-html="col4Txt"></div>           
      </div>
    </div>
  </div>
</section>
</template>

<script setup>
defineProps({
  textoPrincipal: String, 
  col1Tit: String,
  col1Txt: String,
  col2Tit: String,
  col2Txt: String,
  col3Tit: String,
  col3Txt: String,
  col4Tit: String,
  col4Txt: String,
})
</script>
