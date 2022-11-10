<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Subtitulo="secciones[0].Content[1].item.Titulo"
        :Texto="secciones[0].Content[2].item.Texto"
        :Landing="false">
        </Portada>

        <NosotrosPresentacion></NosotrosPresentacion>
        <NosotrosSpeech></NosotrosSpeech>
        <GeneralesGridBlog></GeneralesGridBlog>
        <NosotrosContacto></NosotrosContacto>
        <GeneralesCta breadcrumb="detalles" enlace="/Cursos"></GeneralesCta>
    </main>
</template>

<script setup>
import {usePageData} from '../composables/usePageData';
import Portada from '../components/Generales/Portada.vue'
//Head y SEO
useHead({
    title: 'Sobre Nosotros | Cap Total'
})

const {datos, secciones, getPageData, getPageSections} = usePageData();
//Instanciamos
await getPageData(9);
await getPageSections(9);
</script>