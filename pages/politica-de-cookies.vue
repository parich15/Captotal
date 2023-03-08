<template>
    <main>
        <section class="flex h-48 bg-orange-400 justify-center items-center relative z-20 shadow-xl shadow-slate-300">
            <h1 class="text-xl md:text-3xl lg:text-5xl font-titulo font-semibold text-white tracking-wide">Política de Cookies</h1>
        </section>
        <section id="Contenido Test" class="my-5 container mx-auto" v-for="contenido in secciones[0].Content" :key="contenido.id">
            <div v-for="seccion in contenido" class="pt-10">
                <div class="mx-2 font-texto text-base antialiased" v-html="seccion.Texto">
                </div>
            </div>        
        </section>
    </main>
</template>

<script setup>
import { usePageData } from '~~/composables/usePageData';
const {secciones, getPageSections } = usePageData();

await getPageSections(10);
</script>
