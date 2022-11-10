<template>
    <ul>
        <li class="group inline-block hover:md:scale-105 transition origin-center" v-for="enlace in enlaces" :key="enlace.titulo">
            <NuxtLink :to="enlace.enlace" class=" group-hover:md:hover:bg-white/5 group-hover:md:hover:text-orange-500 md:p-2 md:rounded ">
                {{enlace.titulo}}
            </NuxtLink>
        </li>
    </ul>
</template>

<script setup>
const enlaces = [
    {
        titulo: "Cursos",
        enlace: '/Cursos'
    },
    {
        titulo: "Permisos",
        enlace: '/Permisos'
    },
    {
        titulo: "CAP Online",
        enlace: '/Cap-online'
    },
    {
        titulo: "Sobre Nosotros",
        enlace: '/Nosotros'
    },
    {
        titulo: "Blog",
        enlace: '/Blog'
    },
]
</script>

