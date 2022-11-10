<template>
<section>
    <div class="relative overflow-hidden bg-white shadow-md">
      <div class="mx-auto max-w-7xl">
        <div class="relative z-10 bg-white pb-8 sm:pb-16 md:pb-20 lg:w-full lg:max-w-2xl lg:pb-28 xl:pb-32">
          <svg class="absolute inset-y-0 right-0 hidden h-full w-48 translate-x-1/2 transform text-white lg:block" fill="currentColor" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">
            <polygon points="50,0 100,0 50,100 0,100" />
          </svg>      
        <div class="relative px-4 pt-6 sm:px-6 lg:px-8">
        </div>
      <section class="mx-auto mt-10 max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
        <div class="sm:text-center lg:text-left">
          <h1 class="text-4xl font-titulo font-bold tracking-tight text-gray-700 sm:text-5xl md:text-7xl">
            <span class="block xl:inline">Tu centro formativo</span>
            <span class="block text-orange-600 xl:inline"> de CAP y ADR</span>
          </h1>
          <div class="mt-3 text-base font-texto text-gray-500 sm:mx-auto sm:mt-5 sm:max-w-xl sm:text-lg md:mt-5 lg:mx-0 font-semibold" v-html="Descripcion"></div>
          <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <div class="rounded-md shadow">
              <NuxtLink to="/Cursos" class="boton-primario transform scale-100 hover:scale-105 hover:shadow-md transition-all font-texto font-bold">
                <span>Explorar cursos</span> 
              </NuxtLink>
            </div>
            <div class="mt-3 sm:mt-0 sm:ml-3 hidden lg:block">
              <a href="#" class="boton-secundario transform scale-100 hover:scale-105 hover:shadow-md transition-all font-texto font-bold">Consigue tu carnet</a>
            </div>
          </div>
        </div>
    </section>
    </div>
  </div>
  <div class="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
    <img class="h-56 w-full object-cover sm:h-72 md:h-96 lg:h-full lg:w-full object-right" :src="`http://167.99.198.188:8055/assets/${Portada}`" alt="">
  </div>
</div>
</section>
</template>

<script setup>
defineProps({
  Portada:{
    type: undefined,
    required: true
  },
  Descripcion:{
    type: undefined
  }
})
</script>
