<template>
    <section class="bg-slate-900  w-screen">
        <div class="px-3  border-b border-gray-800 py-7 container mx-auto md:text-center">
            <h4 class="font-titulo text-gray-600 text-md mb-2">Estás consultando nuestros {{breadcrumb}}</h4>
            <h3 class=" font-titulo text-xl text-orange-500  font-bold">¿Estás buscando conseguir un {{detalle.slice(0,-1)}} profesional?</h3>
            <p class=" font-titulo text-gray-400  mb-5">Descubre todos los {{detalle}} que puedes obtener</p>
            <NuxtLink :to="enlace" class="boton-primario w-2/4 md:mx-auto text-lg font-texto font-semibold lg:w-1/4">Ver {{enlace.substring(1)}}</NuxtLink>
        </div>
    </section>
</template>

<script setup>
const props = defineProps({
    breadcrumb: String,
    enlace:String
})

const detalle = computed(()=>{
    if(props.enlace == '/Cursos'){
        return 'certificados'
    }else{
        return 'permisos'
    }
})
</script>
