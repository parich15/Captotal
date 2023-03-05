<template>
    <main class="bg-gray-50 overflow-hidden" v-show="datos && secciones">
            
        <!-- <Hero :Portada="datos.Portada" :Descripcion="secciones[0].Content[0].item.Texto"></Hero> -->
        <InicioCarousel></InicioCarousel>

        <SelectorCursos 
            :Titulo="secciones[1].Content[0].item.Titulo"
            :Descripcion="secciones[1].Content[1].item.Texto">
        </SelectorCursos>
        
        <Bonificados
            :Titulo="secciones[2].Content[0].item.Titulo"
            :Subtitulo="secciones[2].Content[1].item.Titulo"
            :Descripcion="secciones[2].Content[2].item.Texto"
            :Imagen="secciones[2].Content[3].item.Imagen">
        </Bonificados>

        <!-- SEPARADOR SECCIÓN BLACK -->
        <div class="md:mt-32 text-gray-900 w-[102vw] md:w-screen block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="currentColor" fill-opacity="1" d="M0,128L60,117.3C120,107,240,85,360,96C480,107,600,149,720,154.7C840,160,960,128,1080,101.3C1200,75,1320,53,1380,42.7L1440,32L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"></path></svg>
        </div>

        <Ventajas></Ventajas>

        <div class="text-gray-900 w-[102vw] md:w-screen block">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#111827" fill-opacity="1" d="M0,96L60,117.3C120,139,240,181,360,197.3C480,213,600,203,720,176C840,149,960,107,1080,112C1200,117,1320,171,1380,197.3L1440,224L1440,0L1380,0C1320,0,1200,0,1080,0C960,0,840,0,720,0C600,0,480,0,360,0C240,0,120,0,60,0L0,0Z"></path></svg>
        </div>

        <!-- FIN SEPARADOR -->
        
        <Empresas 
        :Titulo="secciones[4].Content[1].item.Titulo"
        :Subtitulo="secciones[4].Content[0].item.Titulo"
        :Texto="secciones[4].Content[2].item.Texto"></Empresas>
        <Colaboran></Colaboran>
        
    </main>
</template>

<script setup>
import Hero from '~~/components/Inicio/Hero.vue';
import { usePageData } from '~~/composables/usePageData';
import SelectorCursos from '../components/Inicio/SelectorCursos.vue';
import Bonificados from '~~/components/Inicio/Bonificados.vue';
import Ventajas from '../components/Inicio/Ventajas.vue';
import Empresas from '../components/Inicio/Empresas.vue';
import Colaboran from '../components/Inicio/Colaboran.vue';
const {datos, secciones, getPageData, getPageSections } = usePageData();
await getPageData(5)
await getPageSections(5);


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

