<template>
    <section class="container mx-auto">
       <div class="mx-5 flex justify-center lg:translate-y-32 tracking-widest">
        <button @click="abrirSeccion" class="font-titulo font-semibold text-white uppercase text-2xl bg-orange-400 p-4 rounded hover:scale-105 transition-transform duration-200 hover:bg-orange-500">
            <span v-if="!showSeccion">Ver Calendarios</span>
            <span v-else>Cerrar Calendarios</span>
        </button>
       </div>

       <Transition name="calendarios">
        <div class="lg:translate-y-36" v-if="showSeccion">
            <div class="grid mt-20 gap-20 lg:gap-2" :class="futuro ? 'lg:grid-cols-2' : 'grid-cols-1'">
                <div class="mx-auto flex flex-col">
                    <img class=" object-cover" :src="`http://167.99.198.188:8055/assets/${actual}`" alt="">
                    <h4 class="text-center mt-6 font-titulo text-3xl text-orange-500 font-semibold">Curso actual</h4>
                </div>
                <div class="mx-auto flex flex-col" v-if="futuro">
                    <img :src="`http://167.99.198.188:8055/assets/${futuro}`" alt="">
                    <h4 class="text-center mt-6 font-titulo text-3xl text-orange-500 font-semibold">Próximo Curso</h4>
                </div>
            </div>
       </div>
       </Transition>
       
    </section>
</template>

<script setup>
const props = defineProps({
    actual: String,
    futuro: String || null
})

const showSeccion = ref(false);
const abrirSeccion = () => showSeccion.value = !showSeccion.value
</script>

<style>
.calendarios-enter-from,
.calendarios-leave-to {
    opacity: 0;
};
.calendarios-enter-to,
.calendarios-leave-from {
    opacity: 100%;
}
.calendarios-enter-active,
.calendarios-leave-active {
    transition: all 300ms;
}
</style>

