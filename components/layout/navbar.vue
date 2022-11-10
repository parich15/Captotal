<template>
    <div class="sticky top-0 z-50 border-t border-gray-800">
        <div class="w-full overflow-hidden bg-gray-900 shadow-lg flex px-3 h-16 items-center">
        
            <!-- Logo -->
        <NuxtLink to="/" style="background-color: transparent;">
            <div class="w-1/4 lg:ml-2 group">
                <img alt="Inicio | Cap Total" width="114" height="48" class="h-12 max-w-xs group-hover:lg:scale-95 transition " src="~~/src/logo.webp">
            </div>
        </NuxtLink>

        <!-- Navegación Ordenador -->
            <div class="hidden md:flex ml-auto mr-3">
                <Enlaces class="flex gap-5 lg:gap-6 font-titulo font-bold md:text-lg lg:text-2xl text-orange-400"></Enlaces>
            </div>

            <!-- Navegacion Movil -->
            <div class="block md:hidden ml-auto">
                <button @click="mostrarMenuMovil = !mostrarMenuMovil" class="hover:text-orange-500 text-orange-400">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-8 h-8">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12H12m-8.25 5.25h16.5" />
                        </svg>
                </button>
            </div>
            
            <!-- Modal Movil -->
            <div v-if="mostrarMenuMovil" class="bg-slate-900/80 backdrop-blur w-screen h-screen absolute top-16 left-0 overflow-hidden">
                <div class="container flex flex-col h-full justify-center">
                    <div class="flex flex-col mx-6">
                        <Enlaces class="enlacesMovil mb-12 font-titulo text-4xl flex flex-col gap-12 font-bold text-transparent bg-clip-text bg-gradient-to-br from-orange-500 to-yellow-600 "></Enlaces>
                    </div> 
                </div>
            </div>
            
        </div>
    </div>
</template>

<script setup>
import Enlaces from "./enlaces.vue";
const ruta = useRoute();
const mostrarMenuMovil = ref(false);

watch(mostrarMenuMovil,()=>{
    if(mostrarMenuMovil.value == true){
        document.querySelector('body').classList.add('overflow-hidden');
    }else{
        document.querySelector('body').classList.remove('overflow-hidden');

    }
});
watch(ruta,()=>{
    mostrarMenuMovil.value = false;
})
</script>
