<template>
    <div>
        <NuxtLink :to="{name: 'Curso-Titulo' , params:{Titulo: tituloUrl}, query:{id: id}}"
          class="block rounded-xl border transition border-gray-100 p-4 shadow-sm hover:border-orange-200 hover:ring-1 hover:ring-orange-200 focus:outline-none focus:ring group hover:bg-orange-500 duration-500 ease-in-out transform hover:scale-105 max-h-[200px]"
        >
          <span class="inline-block rounded-lg bg-oram-50 p-3">
            <svg
              class="h-6 w-6 text-orange-500 group-hover:text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 14l9-5-9-5-9 5 9 5z"></path>
              <path
                d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"
              ></path>
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222"
              ></path>
            </svg>
          </span>

          <h6 class="mt-2 font-bold font-titulo text-lg lg:text-xl text-orange-500 transition group-hover:text-white">{{Titulo}}</h6>

          <p class="hidden sm:mt-1 sm:block sm:text-sm sm:text-gray-500 font-texto font-semibold group-hover:text-white">
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
    }
})

const showDescripcion = computed(()=>{
    if(props.Descripcion.length >= 40){
        return truncar(props.Descripcion, 35)
    }else{
        return props.Descripcion
    }
})

const tituloUrl = computed(()=>{
    return props.Titulo.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replaceAll(" ", "");
})
</script>
