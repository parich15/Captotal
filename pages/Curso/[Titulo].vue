<template>
    <main id="Curso" class="bg-gray-100 overflow-hidden">
        <!-- Intro / Portada + Info -->
        <suspense>
            <Portada
            :Imagen="curso.Portada"
            :Titulo="curso.Titulo"
            :Subtitulo="curso.Subtitulo"
            :Texto="curso.Descripcion"
            :Landing="true"
            ></Portada>
        </suspense>

        <Datos
        :duracion="curso.Duracion"
        :precio="curso.Precio"
        :fecha="curso.fecha_inicio"
        :documentacion="curso.Documentacion"
        :bonificado="curso.Bonificado"
        :tipo="curso.Tipo" 
        ></Datos>

        <Introduccion
        :Titulo="secciones[0].Content[0].item.Titulo"
        :Subtitulo="secciones[0].Content[1].item.Titulo"
        :Texto="secciones[0].Content[2]?.item.Texto"></Introduccion>

        <section class="container mx-auto pb-16 lg:pb-12">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-0">
                <div class="mx-5 row-start-2 md:row-start-1">
                    <Contenido
                    v-if="secciones[1]"
                    :Titulo="secciones[1]?.Content[0]?.item.Titulo"
                    :Subtitulo="secciones[1]?.Content[1]?.item.Titulo"
                    :Contenido="secciones[1]?.Content[2]?.item.Texto"
                    ></Contenido>
                    <ul v-if="curso.Desplegable" id="Desplegables" class="list-none lg:pt-2">
                        <li class="my-5 lg:my-6"
                        v-for="desplegable in curso.Desplegable" >
                            <Desplegable :titulo="desplegable.Titulo" :contenido="desplegable.Texto"></Desplegable>
                        </li>
                    </ul>
                </div>
                

                <Precios
                :id="curso.id"
                :Titulo="curso.Titulo"
                :Precio="curso.Precio"
                :Contenidos="curso.Contenidos"
                @init-checkout="checkout = true"></Precios>
            </div>
        </section>
        <!-- Fin Intro -->

        <!-- Calendarios -->
        <Informacion
        v-if="curso.Calendario_Actual"
        :actual="curso.Calendario_Actual"
        :futuro="curso?.Calendario_Proximo"></Informacion>
        <!-- Fin Calendarios -->

        <!-- Separador Ventajas -->
        <div class="w-[110vw]">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 119 1500 200">
                <path fill="#111827" fill-opacity="1" d="M0,128L48,133.3C96,139,192,149,288,181.3C384,213,480,267,576,293.3C672,320,768,320,864,304C960,288,1056,256,1152,250.7C1248,245,1344,267,1392,277.3L1440,288L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z"></path>
            </svg>
        </div>
            <Ventajas></Ventajas>
        <div class="w-[105vw] -translate-y-18">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 320"><path fill="#111827" fill-opacity="1" d="M0,128L48,133.3C96,139,192,149,288,181.3C384,213,480,267,576,293.3C672,320,768,320,864,304C960,288,1056,256,1152,250.7C1248,245,1344,267,1392,277.3L1440,288L1440,0L1392,0C1344,0,1248,0,1152,0C1056,0,960,0,864,0C768,0,672,0,576,0C480,0,384,0,288,0C192,0,96,0,48,0L0,0Z"></path></svg>
        </div>
        <!-- Fin Separador -->
        <!-- End Section -->
        <CursoBonificados></CursoBonificados>
        <BotonExplora></BotonExplora>
    </main>
</template>
<script setup>
import {useCursoData} from '~~/composables/useCursoData';
import Portada from '~~/components/Generales/Portada.vue';
import Datos from '~~/components/Curso/Datos.vue';
import Introduccion from '~~/components/Curso/Introduccion.vue';
import Contenido from '~~/components/Curso/Contenido.vue';
import Precios from '~~/components/Curso/Precios.vue';
import Ventajas from '~~/components/Inicio/Ventajas.vue';
import CursoBonificados from '~~/components/Curso/CursoBonificados.vue';
import BotonExplora from '~~/components/Curso/BotonExplora.vue';
import Informacion from '~~/components/Curso/Informacion.vue';
import Desplegable from '~~/components/Curso/Desplegable.vue';
const ruta = useRoute();
const {curso, secciones,  getCursoData, getCursoContenido} = useCursoData();
const checkout = ref(false);

await getCursoData(ruta.query.id);
await getCursoContenido(ruta.query.id);


useHead({
    title: curso.value.Titulo + " | Cap Total",
    meta:[
        {
            hid: 'title',
            name: 'title',
            content:curso.value.Meta_Titulo
        },
        {
            hid: 'description',
            name: 'description',
            content:curso.value.Meta_Descripcion
        },
        {
            hid: 'og:title',
            name: 'og:title',
            content:curso.value.Titulo
        },
        {
            hid: 'og:description',
            name: 'og:description',
            content:curso.value.Meta_Descripcion,
         },
    ]
})
</script>
