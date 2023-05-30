<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Texto="secciones[0].Content[2].item.Texto"
        :Subtitulo="secciones[0].Content[1].item.Titulo"
        :Landing="false"></Portada>

         <!-- Separador -->
         <!-- <div class="-translate-y-5 w-[102vw] sm:-translate-y-10 lg:-translate-y-20"> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#111827" fill-opacity="1" d="M0,64L480,128L960,128L1440,192L1440,0L960,0L480,0L0,0Z"></path></svg>
        </div> -->
        <GridCursos :Titulo="'Nuestros'" :Span="'Permisos'" :params="params"></GridCursos>
        <Introduccion
            :titulo="secciones[1].Content[0].item.Titulo"
            :texto="secciones[1].Content[1].item.Texto"></Introduccion>
        <Cta breadcrumb="permisos" :enlace="'/Cursos'"></Cta>
    </main>
</template>

<script setup>
import { usePageData } from '~~/composables/usePageData';
import Portada from '../components/Generales/Portada.vue';
import Introduccion from '../components/Generales/Introduccion.vue';
import GridCursos from '../components/Generales/GridCursos.vue';
import Cta from '~~/components/Generales/Cta.vue';
const {datos, secciones, getPageData, getPageSections } = usePageData();
const params = {filter: {Tipo: "Carnet"}, fields:'id,Activo,Titulo,Precio,Portada,Descripcion,Slug'};

await getPageData(7);
await getPageSections(7);

useHead({
    title: datos.value.Titulo,
    meta:[
        {
            hid: 'title',
            name: 'title',
            content: datos.value.Meta_Titulo
        },
        {
            hid: 'description',
            name: 'description',
            content: datos.value.Meta_Descripcion
        },
        {
            hid: 'og:title',
            name: 'og:title',
            content: datos.value.Titulo
        },
        {
            hid: 'og:description',
            name: 'og:description',
            content: datos.value.Meta_Descripcion,
         },
    ]
})
</script>

