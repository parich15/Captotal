<template>
    <div class="absolute top-0 z-20 w-screen flex justify-center flex-col items-center"> 
        <div class="bg-gray-100/90 max-w-xl p-5 border border-orange-400 rounded">
            <div class="relative">
                <span class="absolute right-0 -top-3 font-texto text-xl hover:scale-110 cursor-pointer hover:origin-center hover:text-orange-500 " @click="$emit('cerrar')">x</span>
            </div>
            <h3 class="font-titulo text-xl text-gray-600 font-bold">{{Titulo}}</h3>
            <p>{{Desc}}</p>
        </div>
    </div>
</template>

<script setup>
defineEmits(['cerrar'])
defineProps({
    Titulo: String,
    Desc: String
})
</script>