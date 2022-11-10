<template>
<section class="container mx-auto mb-20">
    <div class="py-8 lg:py-16 mx-auto max-w-screen-xl px-4">
        <h2 class="mb-8 lg:mb-16 text-3xl tracking-tight leading-tight text-center text-gray-600 md:text-4xl font-titulo opacity-90">Colaboradores<span class="text-orange-500"> | </span>Partners</h2>
        

        <div class="grid grid-cols-2 gap-8 text-gray-500 sm:gap-12 md:grid-cols-3 lg:grid-cols-6 dark:text-gray-400">
            <a href="#" class="flex justify-center items-center">
                <Dgt></Dgt>
            </a>
            <a href="#" class="flex justify-center items-center">
                <PartnersTomTom></PartnersTomTom>
            </a>
            <a href="#" class="flex justify-center items-center">
                <PartnersFomento></PartnersFomento>                     
            </a>

            <a href="#" class="flex justify-center items-center">
                <PartnersTransit></PartnersTransit>                                                                                
            </a>
            <a href="#" class="flex justify-center items-center">
                <Webfleet></Webfleet>
            </a>
        </div>
    </div>
</section>
</template>

<script setup>
import Dgt from '../Partners/Dgt.vue';
import Webfleet from '../Partners/Webfleet.vue';


</script>
<style type="text/css">
</style>

