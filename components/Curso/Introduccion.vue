<template>
    <section class="bg-gray-100 container mx-auto pb-20 pt-48 lg:pt-56">
        <div class="mt-10 mx-5 con">
            <h2 class="font-titulo text-4xl mb-1 font-semibold text-gray-700">{{Titulo}}</h2>
            <h3 class="font-texto font-semibold text-xl text-gray-500 mb-2">{{Subtitulo}}</h3>
            <div class="h-1 w-16 bg-orange-400 rounded mb-6"></div>
            <div class="font-texto text-lg text-justify text-gray-700 " v-html="Texto"></div>
        </div>
    </section>
</template>

<script setup>
defineProps({
    Titulo: {
        type: String,
        required: true,
        default: "Titulo Curso"
    },
    Subtitulo: {
        type: String || null,
        default: "Subtitulo Curso"
    },
    Texto: {
        type: String || null,
        default: "El curso del CAP Inicial tiene como objetivo la obtención del certificado de aptitud profesional. Este título es de carácter obligatorio para todos los conductores profesionales, o si se pretende empezar o continuar con la profesión de conductor profesional de transporte por carretera. Existen dos especialidades para obtener el CAP Inicial: Mercancías y Viajeros.        El CAP de Mercancías como su nombre indica está enfocado para aquellos conductores que en su actividad laboral transporten mercancías, por otro lado el de Viajeros como su nombre indica se enfoca para aquellos conductores que transportan pasajeros. Ambos cursos tienen una duración de 140 horas y constan de un exámen tipo test de 100 preguntas.Si ya has obtenido el CAP necesitarás renovarlo cada 5 años sea cual sea la especialidad escogida, si necesitas renovar el CAP infórmate de nuestros cursos de CAP Continuo."
    }
})
</script>
