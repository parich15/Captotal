<template>
    <section class="container mx-auto mb-20 lg:mb-32 xl:mb-52 mt-12 lg:mt-32">
        <Suspense>
        <div class="w-full text-center mb-10 md:mb-20">
            <h4 class="font-titulo font-semibold antialiased text-4xl text-gray-700 tracking-tight md:text-7xl"> {{Titulo}} <span class="text-orange-500">{{Span}}</span></h4>
        </div>
        </Suspense>
        <div class="grid grid-cols-1 p-2 gap-8 mx-5 lg:gap-12 sm:grid-cols-2 lg:grid-cols-3">
            <Suspense>
               <CursoCard v-for="curso in cursos" :key="curso.id"
               :id="curso.id"
               :Titulo="curso.Titulo"
               :Desc="curso.Descripcion"
               :Precio="curso.Precio"
               :Imagen="curso.Portada"
               :Activo="curso.Activo"
               :Bonificado="curso.Bonificado"></CursoCard>
           </Suspense>
        </div>
    </section>
</template>

<script setup>
import { useCursoData } from '~~/composables/useCursoData';
import CursoCard from './CursoCard.vue';
const {cursos, getAllCursos} = useCursoData();
const props = defineProps({
    params: {
        type: Object,
        required: true
    },
    Titulo: String,
    Span: String
})

await getAllCursos(props.params);
</script>
