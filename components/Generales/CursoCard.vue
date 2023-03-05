<template>
    <!-- Ficha Mini Curso -->
    <article class="shadow-sm md:hover:scale-105 transition duration-200 ease-linear lg:hover:shadow-xl lg:hover:shadow-orange-500/20">
        <div class="relative">
            <img class="rounded-t-md min-h-[300px] object-cover object-center max-h-[310px] w-full" :src="`http://167.99.198.188:8055/assets/${Imagen}`">
        </div>

        <div class="bg-gray-200 border border-gray-200 shadow rounded-b-md">
            <div class="relative ">
                <div class="absolute -top-9 -right-1 h-16 w-16 bg-orange-400 rounded-full hover:bg-orange-500 transition ">
                    <NuxtLink :to="{name:'Curso-Titulo', params: {Titulo: tituloUrl}, query:{id}}">
                        <button class="w-full h-full text-white group">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-9 h-9 mx-auto group-hover:rotate-45 transition duration-100">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                        </svg>
                        </button>
                    </NuxtLink>
                </div>
            </div>
            <div class="p-3 h-[145px]  flex flex-col justify-around">
                <h4 @click="$router.push({name:'Curso-Titulo', params:{Titulo: tituloUrl}, query:{id}})" class="font-titulo font-bold uppercase tracking-normal text-xl text-orange-500 subpixel-antialiased">{{Titulo}}</h4>
                <p class="font-texto text-gray-600 lg:text-regular mb-2 h-[50px]">{{Descripcion}}</p>
                <div class="flex flex-wrap text-xs font-texto text-gray-600 justify-between lg:text-sm">
                    <div v-if="Precio != '000'" class="flex justify-center items-center bg-orange-500 text-white rounded font-sans font-bold w-10 h-7">
                        <span class="pb-[2px]">{{Precio + '€'}}</span>
                    </div>
                    <div v-else class="flex justify-center items-center bg-orange-500 text-white rounded font-sans font-bold w-auto p-2 h-7 mt-[0.5px]">
                        <span class="pb-[2.5px]">Mas Info</span>
                    </div>
                    <span class="p-1 animate-pulse text-orange-400 font-titulo font-bold text-lg" v-if="Bonificado">Bonificado</span>
                    <span class="p-1 text-orange-400 font-titulo font-bold text-lg" v-else-if="Activo">Disponible</span>
                    <span v-else class=" text-titulo text-red-500 font-semibold">Próximamente</span>
                </div>
            </div>
        </div>
    </article>
</template>

<script setup>
import {utils} from '~~/helpers/utils';
const props = defineProps({
    id: Number,
    Titulo: String,
    Desc: String, 
    Precio: String,
    Fecha: String, 
    Imagen: String,
    Activo: Boolean,
    Bonificado: Boolean
})

const {truncar} = utils();

const tituloUrl = computed(()=>{
    return props.Titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "");
})

const Descripcion = computed(()=>{
    if(props.Desc.length >= 65)
    return truncar(props.Desc,60);
    else{
        return props.Desc
    }
})
</script>
