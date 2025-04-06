<template>
<section class="container mx-auto w-full bg-gray-50 lg:mt-28">
  <div class="max-w-screen-xl px-4 py-16 sm:px-6 lg:px-8 mx-auto">
    <div class="grid grid-cols-1 gap-y-8 lg:grid-cols-2 lg:items-center lg:gap-x-16">
      <div class="mx-auto max-w-lg text-center lg:mx-0 lg:text-left">
        <h2 class="text-3xl font-bold sm:text-4xl lg:text-5xl text-gray-700 font-titulo">
          <span class="text-2xl lg:text-4xl text-orange-400 -translate-y-2 inline-block">
          CAP TOTAL
          </span> <br>
          {{Titulo}}
        </h2>
        <div class="mt-3 h-1 w-20 lg:w-12 rounded bg-orange-500 mx-auto lg:mx-0"></div>
        <div class="mt-4 text-gray-500 font-texto text-lg" v-html="Descripcion"></div>
        <div class="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
            <div class="rounded-md shadow">
              <NuxtLink to="/Cursos" class="boton-primario font-titulo transform scale-100 hover:scale-105 hover:shadow-md transition-all font-bold">
                <span>Explorar cursos</span> 
              </NuxtLink>
            </div>
            <div class="mt-3 sm:mt-0 sm:ml-3 lg:block">
              <NuxtLink to="/Permisos" class=" font-titulo boton-secundario transform scale-100 hover:scale-105 hover:shadow-md transition-all  font-bold hover:text-orange-600 hover:bg-transparent hover:bg-orange-200">
                <span>Permisos profesionales</span>
              </NuxtLink>
            </div>
          </div>
      </div>

      <div class="flex flex-col gap-y-5"> 
        <h2 class="text-4xl font-bold text-orange-500 font-titulo animate-pulse">Cursos Destacados</h2>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Minicurso v-for="curso in cursos.slice(0,6)" :key="curso.id" :id="curso.id" :Titulo="curso.Titulo" :Descripcion="curso.Descripcion" :Icono="curso.Icono" :Slug="curso.Slug" ></Minicurso>
        </div>
      </div>


    </div>
  </div>
</section>
</template>

<script setup>
import Minicurso from './Minicurso.vue';
import {useCursoData} from '@@/composables/useCursoData'
const {cursos, getAllCursos} = useCursoData();
const filtros = {filter: {Destacado: true}, fields: 'id, Titulo, Descripcion, Icono, Slug'};

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
