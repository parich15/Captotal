<template>
    <div>
        <IconosAcademico v-if="llave == 'Academico'"></IconosAcademico>
        <IconosFuego v-if="llave == 'Fuego'"></IconosFuego>
        <IconosTruck v-if="llave == 'Camion'"></IconosTruck>
        <IconosWarning v-if="llave == 'Warning'"></IconosWarning>
        <IconosClip v-if="llave == 'Clip'"></IconosClip>
        <IconosRenovacion v-if="llave == 'Renovacion'"></IconosRenovacion>
        <IconosPuente v-if="llave == 'Puente'"></IconosPuente>
    </div>
</template>

<script setup>
defineProps({
    llave:{
        type: String,
        default: "Academico",
        required: true
    }
})
</script>