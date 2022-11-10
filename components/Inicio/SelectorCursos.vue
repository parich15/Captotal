<template>
<section class="container mx-auto w-full bg-gray-50 lg:mt-28">
  <div class="max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 mx-auto">
    <div
      class="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:items-center lg:gap-x-16"
    >
      <div class="mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
        <h2 class="text-3xl font-bold sm:text-4xl lg:text-5xl text-gray-700 font-titulo ">{{Titulo}}</h2>
        <div class="mt-3 h-1 w-20 lg:w-12 rounded bg-orange-500 mx-auto lg:mx-0"></div>
        <div class="mt-4 text-gray-500 font-texto text-lg" v-html="Descripcion"></div>

        <NuxtLink to="/Cursos"
          class="mt-9 boton-outline font-texto font-semibold text-lg hidden md:inline-flex "
          
        >
          <span> Ver todos </span>

          <svg
            class="ml-3 h-5 w-5"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M17 8l4 4m0 0l-4 4m4-4H3"
            />
          </svg>
        </NuxtLink>
      </div>

      <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
            <Minicurso v-for="curso in cursos.slice(0,6)" :key="curso.id" :id="curso.id" :Titulo="curso.Titulo" :Descripcion="curso.Descripcion" ></Minicurso>
      </div>
    </div>
  </div>
</section>
</template>

<script setup>
import Minicurso from './Minicurso.vue';
import {useCursoData} from '@@/composables/useCursoData'
const {cursos, getAllCursos} = useCursoData();
const filtros = {filter: {Destacado: true}, fields: 'id, Titulo, Descripcion'};

defineProps({
    Titulo: {
        type: String,
        default: 'Titulo placeholder'
    },
    Descripcion: {
        type: String
    }
})


await getAllCursos(filtros);
</script>
