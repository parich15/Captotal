<template>
<section class="text-gray-600 body-font container mx-auto">
  <div class=" px-5 py-24 flex flex-col lg:pt-20 lg:pb-0">
    <div class="lg:w-5/6 mx-auto">
      <div class="rounded-lg h-64 overflow-hidden">
        <img alt="Cap Total, centro de formación en el Puerto de Barcelona" class="object-cover object-center h-full w-full" src="../../assets/img/PuertoBarcelona.webp" width="1200" height="500">
      </div>
      <div class="flex flex-col sm:flex-row mt-10">
        <div class=" sm:pl-8 sm:py-8 sm:border-l border-gray-200 sm:border-t-0 border-t mt-4 pt-4 sm:mt-0 text-center sm:text-left">
          <div class="leading-relaxed text-lg mb-4 font-texto" v-html="texto"></div>
         
          <span class="text-orange-500 inline-flex items-center font-semibold text-xs md:text-sm font-titulo">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" class="w-4 h-4 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
            Un conductor bien formado, es un conductor más seguro.
        </span>
        </div>
      </div>
    </div>
  </div>
</section>
</template>

<script setup>
defineProps({
  texto: String
})
</script>

