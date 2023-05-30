<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Texto="secciones[0].Content[1].item.Texto"
        :Landing="false"></Portada>
    
        <GridCursos :Titulo="'Nuestros'" :Span="'Cursos'" :params="params">
        </GridCursos>

        <Introduccion
        :titulo="secciones[1].Content[0].item.Titulo"
        :texto="secciones[1].Content[1].item.Texto">
        </Introduccion>

        <Cta breadcrumb="cursos" enlace="/Permisos">
        </Cta>
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
const params = {filter: {Tipo: "Curso"}, fields:'id,Activo,Titulo,Precio,Portada,Descripcion,Bonificado,Slug'};

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
