<template>
    <div>
        <NuxtLink :to="{name:'Curso-slug', params:{ slug: props.Slug} }"
          class="block rounded-xl border transition border-gray-100 p-4 shadow-sm hover:border-orange-200 hover:ring-1 hover:ring-orange-200 focus:outline-none focus:ring group bg-white hover:bg-orange-500 duration-500 ease-in-out transform hover:scale-105 max-h-[200px]"
        >
          <span class="inline-block rounded-lg bg-oram-50 p-3">
            <Iconos :llave="Icono"></Iconos>
          </span>

          <h6 class="mt-2 font-bold font-titulo text-lg lg:text-xl text-orange-500 transition group-hover:text-white">{{Titulo}}</h6>

          <p class="text-gray-400 sm:mt-1 hidden md:block sm:text-sm sm:text-gray-500 font-texto font-semibold group-hover:text-white">
            {{showDescripcion}}
          </p>
        </NuxtLink>
        </div>
</template>

<script setup>
import {utils} from '@/helpers/utils';
const {truncar} = utils();
const props = defineProps({
    id: Number,
    Titulo: {
        type: String,
        default: 'Titulo Curso'
    },
    Descripcion: {
        type: String,
        default: 'Descripcion Curso'
    },
    Icono: String,
    Slug: String,
})

const showDescripcion = computed(()=>{
    if(props.Descripcion.length >= 40){
        return truncar(props.Descripcion, 33)
    }else{
        return props.Descripcion
    }
})
</script>
