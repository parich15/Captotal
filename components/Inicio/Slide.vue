<template>
    <div class="relative lg:h-[600px]">
        
            <img
            :loading="esPrimera ? 'eager' : 'lazy'"
            :width="ancho"
            height="650"
            class=" object-cover h-[650px] w-auto object-center lg:object-bottom xl:w-screen xl:object-center" 
            :src="'https://admin.captotal.com/assets/'+Imagen+'?fit=cover&quality=70'" :alt="Titulo + ' | ' + Tipo + ' Profesional Cap Total'">

        <div class="absolute top-0 h-full w-full bg-gray-100 opacity-80 z-10"></div>
        <div class="absolute top-0 h-full w-full z-20">
            <div class="container mx-auto flex flex-col h-full justify-center lg:justify-start">
                    <div class="flex flex-grow flex-col lg:items-start lg:ml-12 lg:mb-36 lg:justify-end justify-center">
                        <span class="font-titulo font-semibold text-gray-500 text-xl pb-1 lg:text-orange-500 fade-in">{{ Tipo }} Destacado</span>
                        <NuxtLink :to="Enlace">
                         <p  :class="Titulo.length < 20 ? 'text-5xl' : 'text-4xl' " 
                        class="text-focus-in font-titulo font-semibold  text-orange-500 mt-2 lg:mt-4 lg:text-6xl">
                            {{ Titulo }}
                        </p>
                        </NuxtLink>
                        <div class="mt-3 block font-titulo font-semibold text-xl ml-1 text-gray-600 text-focus-in-delayed lg:text-left" v-html="Texto"></div>
                        <button 
                       
                        @click="$router.push(Enlace)"
                        class="hidden lg:block py-2 px-3 bg-orange-500/70 text-white font-titulo font-semibold rounded text-focus-in-delayed mt-3 hover:bg-orange-500 transition">Ir al {{ Tipo.toLocaleLowerCase() }}</button>
                    </div> 
                    <button
                        @click="$router.push(Enlace)"
                        class="block lg:hidden w-2/3 mx-auto -translate-y-12 py-2 px-3 bg-orange-500/70 text-white font-titulo font-semibold rounded text-focus-in-delayed hover:bg-orange-500 transition">Ir al {{ Tipo.toLocaleLowerCase() }}</button>
                </div>
            </div>
        </div>
</template>

<script setup>
defineProps({
    Titulo: {
        type: String, 
        required: true
    },
    Texto:{
        type: String,
        required: false
    },
    Enlace:{
        type: String, 
        required: true
    },
    Imagen: {
        type: String,
        required: true
    },
    Tipo:{
        type: String,
        required: true
    },
    esPrimera:{
        type:Boolean
    }
})

const ancho = ref(null);

onMounted(()=>{
    ancho.value = document.body.clientWidth
})
</script>
<style scoped>
.text-focus-in{-webkit-animation:text-focus-in 1s cubic-bezier(.55,.085,.68,.53) both;animation:text-focus-in 1s cubic-bezier(.55,.085,.68,.53) both}
.text-focus-in-delayed{-webkit-animation:text-focus-in 1s cubic-bezier(.55,.085,.68,.53) both;animation:text-focus-in 1s cubic-bezier(.55,.085,.68,.53) 1s both}

.fade-in{-webkit-animation:fade-in 1s cubic-bezier(.39,.575,.565,1.000) both;animation:fade-in 1s cubic-bezier(.39,.575,.565,1.000) 0.5s both}
/* ----------------------------------------------
 * Generated by Animista on 2023-1-13 20:34:6
 * Licensed under FreeBSD License.
 * See http://animista.net/license for more info. 
 * w: http://animista.net, t: @cssanimista
 * ---------------------------------------------- */
@-webkit-keyframes text-focus-in{0%{-webkit-filter:blur(12px);filter:blur(12px);opacity:0}100%{-webkit-filter:blur(0);filter:blur(0);opacity:1}}@keyframes text-focus-in{0%{-webkit-filter:blur(12px);filter:blur(12px);opacity:0}100%{-webkit-filter:blur(0);filter:blur(0);opacity:1}}
@-webkit-keyframes text-focus-in-delayed{0%{-webkit-filter:blur(12px);filter:blur(12px);opacity:0}100%{-webkit-filter:blur(0);filter:blur(0);opacity:1}}@keyframes text-focus-in-delayed{0%{-webkit-filter:blur(12px);filter:blur(12px);opacity:0}100%{-webkit-filter:blur(0);filter:blur(0);opacity:1}}
@-webkit-keyframes fade-in{0%{opacity:0}100%{opacity:1}}@keyframes fade-in{0%{opacity:0}100%{opacity:1}}
</style>
