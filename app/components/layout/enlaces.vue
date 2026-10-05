<template>
    <ul>
        <li class="group inline-block transition origin-center" v-for="(enlace, index) in enlaces" :key="enlace.titulo">
            <NuxtLink :to="enlace.Url" class="group-hover:md:hover:bg-white/5 group-hover:md:hover:text-orange-500 md:p-2 md:rounded ">
                {{enlace.Nombre}}
            </NuxtLink>
            <div v-if="enlace.Submenu" class="md:absolute hidden group-hover:md:block p-2 bg-gray-900 z-[9999] w-1/6 lg:w-auto rounded-b transition hover:md:block">
                <ul class="relative w-auto group flex flex-col">
                    <li v-for="submenu in enlace.Submenu" :key="submenu.id" class="my-3 ">
                        <NuxtLink :to="submenu.Url" class="text-2xl p-2 rounded group-hover:md:hover:bg-white/5 group-hover:md:hover:text-orange-500">
                            {{ submenu.Nombre }}
                        </NuxtLink>
                    </li>
                </ul>
            </div>
        </li>
    </ul>
</template>

<script setup>
const props = defineProps({
    enlaces: {
        type: Array,
        required: true
    }
});
</script>

