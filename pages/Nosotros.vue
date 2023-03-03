<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Subtitulo="secciones[0].Content[1].item.Titulo"
        :Texto="secciones[0].Content[2].item.Texto"
        :Landing="false">
        </Portada>
        <NosotrosPresentacion
        :textoPrincipal="secciones[1].Content[2].item.Texto"
        :col1Tit="secciones[2].Content[0].item.Titulo"
        :col1Txt="secciones[2].Content[1].item.Texto"
        :col2Tit="secciones[2].Content[2].item.Titulo"
        :col2Txt="secciones[2].Content[3].item.Texto"
        :col3Tit="secciones[2].Content[4].item.Titulo"
        :col3Txt="secciones[2].Content[5].item.Texto"
        :col4Tit="secciones[2].Content[6].item.Titulo"
        :col4Txt="secciones[2].Content[7].item.Texto">
        </NosotrosPresentacion>
        <NosotrosSpeech
        :texto="secciones[3].Content[1].item.Texto">
        </NosotrosSpeech>
        <GeneralesGridBlog class="hidden"></GeneralesGridBlog>
        <NosotrosContacto></NosotrosContacto>
        <GeneralesCta breadcrumb="detalles" enlace="/Cursos"></GeneralesCta>
    </main>
</template>

<script setup>
import {usePageData} from '../composables/usePageData';
import Portada from '../components/Generales/Portada.vue';

//Head y SEO
useHead({
    title: 'Sobre Nosotros | Cap Total',
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

const {datos, secciones, getPageData, getPageSections} = usePageData();
//Instanciamos
await getPageData(9);
await getPageSections(9);
</script>