<template>
    <div class="relative">
        <div class="absolute rounded-xl bg-gray-50 -top-10 w-11/12 mx-auto left-0 right-0 p-3 container shadow-md shadow-orange-500/10">
            <div class="flex flex-col text-center">
                <h3 class="font-titulo font-semibold text-xl text-gray-600 lg:text-2xl lg:mb-3">Datos del curso</h3>
                <!-- <hr class="w-10/12 mx-auto border-orange-200"> -->
                <div class="grid grid-cols-3 py-3">
                    <div>
                        <p class="font-titulo font-semibold text-gray-600 lg:text-2xl">Duración</p>
                        <span class="font-texto font-bold text-orange-500 lg:text-xl">{{duracion}}</span>
                    </div>
                    <div class="border-r border-l">
                        <p class="font-titulo font-semibold text-gray-600 lg:text-2xl">Precio</p>
                        <span class="font-texto font-bold text-orange-500 lg:text-2xl hover:underline cursor-pointer animate-pulse hover:animate-none" v-if="bonificado" @click="mostrarInfo">Bonificado</span>
                        <span class="font-texto font-bold text-orange-500 lg:text-xl" v-else>{{precio}} €</span>
                    </div>
                    <div>
                        <p class="font-titulo font-semibold text-gray-600 lg:text-2xl">Fecha Inicio</p>
                        <span class="font-texto font-bold text-orange-500 lg:text-xl">{{new Date(fecha).toLocaleDateString()}}</span>
                    </div>
                </div>
                <hr class="w-10/12 mx-auto">
                <div class="text-center mt-2 mb-2">
                    <p class="font-titulo font-semibold text-gray-600 lg:text-2xl">Documentación</p>
                    <ul id="Documentacion" class=" inline-flex font-texto gap-2 text-md text-orange-500 lg:text-xl content-center">
                        <li class v-for="documento in documentacion" :key="documento">{{documento}}</li>
                    </ul>
                </div>
            </div>
        </div>
        <Transition name="bonificados">
            <Card v-if="showBonificacionInfo" @cerrar="cerrarInfo"
            :Titulo="'Esto es un curso bonificado'"
            :Desc="'Lorem ipsum dolor sit amet consectetur adipisicing elit. Commodi harum beatae adipisci quaerat quisquam. Ex nisi, debitis pariatur minus eos itaque quibusdam non fuga omnis et earum fugit architecto molestias.'"></Card>       
        </Transition>
    </div>
</template>

<script setup>
import Card from '~~/components/Generales/Card.vue'
defineProps({
    duracion: String, 
    precio: String,
    fecha: String,
    documentacion: Array,
    bonificado: Boolean
})
const showBonificacionInfo = ref(false);
const cerrarInfo = () => showBonificacionInfo.value = false;
const mostrarInfo = () => showBonificacionInfo.value = !showBonificacionInfo.value;
</script>
<style scoped>
#Documentacion >li + li::before {
    content: " | ";
}

.bonificados-enter-active,
.bonificados-leave-active {
  transition: opacity 0.5s ease;
}

.bonificados-enter-from,
.bonificados-leave-to {
  opacity: 0;
}
</style>