<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Texto="secciones[0].Content[1].item.Texto"
        :Landing="false"></Portada>

        <Introduccion></Introduccion>
        <!-- Separador -->
        <div class="-translate-y-5 w-[102vw] sm:-translate-y-10 lg:-translate-y-20"> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#111827" fill-opacity="1" d="M0,64L480,128L960,128L1440,192L1440,0L960,0L480,0L0,0Z"></path></svg>
        </div>
        <GridCursos :Titulo="'Nuestros'" :Span="'Cursos'" :params="params"></GridCursos>
        <Cta breadcrumb="cursos" enlace="/Permisos"></Cta>
    </main>
</template>

<script setup>
import { usePageData } from '~~/composables/usePageData';
import Portada from '../components/Generales/Portada.vue';
import Introduccion from '../components/Generales/Introduccion.vue';
import GridCursos from '../components/Generales/GridCursos.vue';
import Cta from '~~/components/Generales/Cta.vue';
const {datos, secciones, getPageData, getPageSections } = usePageData();

await getPageData(6);
await getPageSections(6);
const params = {filter: {Tipo: "Curso"}, fields:'id,Activo,Titulo,Precio,Portada,Descripcion,Bonificado'};

useHead({
    title: datos.value.Titulo,
})
</script>
