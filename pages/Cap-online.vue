<template>
    <main class="bg-gray-50 overflow-hidden">
        <Portada
        :Imagen="datos.Portada"
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Texto="secciones[0].Content[1].item.Texto"
        :Subtitulo="secciones[0].Content[2].item.Titulo"
        :Landing="false">
        </Portada>

        <GeneralesIntroduccion></GeneralesIntroduccion>
        
        <!-- Separador -->
        <div class="-translate-y-5 w-[102vw] sm:-translate-y-10 lg:-translate-y-20"> 
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#111827" fill-opacity="1" d="M0,128L120,160C240,192,480,256,720,256C960,256,1200,192,1320,160L1440,128L1440,0L1320,0C1200,0,960,0,720,0C480,0,240,0,120,0L0,0Z"></path></svg>
        </div>

        <GeneralesGridCursos
        :Titulo="'Cursos'"
        :Span="'Online'" 
        :params="params">
        </GeneralesGridCursos>
        <GeneralesCta breadcrumb="cursos online" enlace="/Cursos"></GeneralesCta>
    </main>
</template>

<script setup>
import {usePageData} from '../composables/usePageData';
import Portada from '../components/Generales/Portada.vue'


//Titulo y SEO
useHead({
    title: 'CAP Online | Cap Total'
})
//Datos
const {datos, secciones, getPageData, getPageSections} = usePageData();
const params = {filter: {Tipo: "Online"}, fields:'id,Activo,Titulo,Precio,Portada,Descripcion'};

//Instanciamos
await getPageData(8);
await getPageSections(8);
</script>
