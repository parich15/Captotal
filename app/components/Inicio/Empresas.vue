<template>
<section id="profesionales-3d" class="scroll-mt-20 pt-20 lg:pt-0 pb-12 lg:pb-[90px] overflow-hidden container mx-auto bg-gray">
    
       <div class="flex flex-wrap justify-between items-center -mx-4">
        <div class="w-full lg:w-6/12 px-4">
           <Scene3D
              kind="professionals"
              label="Cuatro profesionales del transporte, dos conductoras y dos conductores, rodeados por autobuses y camiones en una carretera elíptica"
              :fallback-image="professionalsFallback"
              class="professionals-scene"
           />
        </div>

          <!-- Texto -->
          <div class="w-full lg:w-1/2 xl:w-8/12 px-4 max-w-sm mx-auto">
             <div class="mt-10 lg:mt-0">
                <span class="font-bold text-lg text-primary mb-2 block font-titulo antialiased text-gray-600 lg:text-xl lg:font-texto">
                    {{Subtitulo}}
                </span>
                <h2 class="font-bold text-3xl sm:text-4xl text-dark mb-2 font-texto text-gray-700">
                   {{Titulo}}
                </h2>

                <div class="h-1 w-12 bg-orange-500 rounded block mb-8"></div>
                <div class="text-base md:text-lg text-gray-600 font-texto text-body-color mb-8" v-html="Texto"></div>
               
                <NuxtLink
                  to="/Nosotros"
                   class="font-titulo font-semibold boton-primario sm:w-3/4">
                  Ponte en contacto
                </NuxtLink>
             </div>
          </div>
       </div>
    
 </section>
 
</template>

<script setup>
import Scene3D from './Scene3D.vue'
import professionalsFallback from '~/assets/img/ImagenBonificados1.webp'

defineProps({
   Titulo: String,
   Subtitulo: String,
   Texto: String
})
</script>

<style scoped>
.professionals-scene {
   width: 100%;
   height: clamp(360px, 55vw, 640px);
   overflow: hidden;
   border-radius: 1.5rem;
   box-shadow: 0 20px 25px -5px rgb(0 0 0 / .1), 0 8px 10px -6px rgb(0 0 0 / .1);
}
</style>
