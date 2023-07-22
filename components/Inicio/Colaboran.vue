<template>
<section class="container mx-auto mb-20">
    <div class="py-8 lg:py-16 mx-auto max-w-screen-xl px-4">
        <h2 class="mb-8 lg:mb-16 text-3xl tracking-tight leading-tight text-center text-gray-600 md:text-4xl font-titulo opacity-90">Colaboradores<span class="text-orange-500"> | </span>Partners</h2>
        

        <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
            <a aria-label="Enlace hacia la web de DGT" target="_blank" rel="follow" href="https://www.dgt.es/inicio/" class=" max-h-20 flex justify-center items-center">
                <Dgt></Dgt>
            </a>
            <a aria-label="Enlace hacia la web de TomTom" target="_blank" rel="follow" href="https://www.tomtom.com/es_es/navigation/" class=" max-h-20 flex justify-center items-center">
                <TomTom></TomTom>
            </a>
            <a aria-label="Enlace hacia la web de Fomento" target="_blank" rel="follow" href="https://www.mitma.gob.es/transporte_terrestre" class=" max-h-20 flex justify-center items-center">
                <PartnersFomento></PartnersFomento>                     
            </a>

            <a aria-label="Enlace hacia la web de Transit" target="_blank" rel="follow" href="https://transit.gencat.cat/ca/inici" class=" max-h-20 flex justify-center items-center">
                <PartnersTransit></PartnersTransit>                                                                                
            </a>
            <a aria-label="Enlace hacia la web de WebFleet" target="_blank" rel="follow" href="https://www.webfleet.com/es_es/webfleet/" class=" max-h-20 flex justify-center items-center">
                <Webfleet></Webfleet>
            </a>
            <a aria-label="Enlace hacia la web de Autoescuela Car Land" target="_blank" rel="follow" href="https://autoescuelacarland.com/" class=" max-h-20 flex justify-center items-center">
                <Carland></Carland>
            </a>
        </div>
    </div>
</section>
</template>

<script setup>
import Dgt from '../Partners/Dgt.vue';
import TomTom from '../Partners/TomTom.vue'
import Webfleet from '../Partners/Webfleet.vue';
import Carland from '../Partners/Carland.vue';

</script>
<style type="text/css">
</style>

