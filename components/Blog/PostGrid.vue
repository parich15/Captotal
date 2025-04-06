<template>
  <section class="text-gray-600 body-font mx-auto container">
    <!-- Hero Section -->
    <div class="relative overflow-hidden bg-gray-900 py-24 mt-10 rounded-xl">
      <div class="absolute inset-0">
        <img src="~~/assets/img/PuertoBarcelona.webp" alt="Blog background" class="w-full h-full object-cover opacity-20">
        <div class="absolute inset-0 bg-gradient-to-r from-gray-900 to-gray-900/80"></div>
      </div>
      
      <div class="relative mx-auto max-w-screen-xl px-4 py-12 sm:px-6 lg:items-center">
        <div class="max-w-3xl">
          <h1 class="text-3xl font-bold text-white sm:text-5xl font-titulo">
            Blog Cap Total
            <span class="block text-orange-500 text-xl sm:text-2xl mt-2">Noticias y artículos del sector del transporte</span>
          </h1>
          
          <p class="mt-6 text-lg text-gray-300 font-texto">
            Descubre las últimas novedades, consejos y artículos sobre el sector del transporte y la formación vial profesional. Mantente al día con las últimas tendencias y regulaciones.
          </p>
        </div>
      </div>
    </div>

    <!-- Featured Posts -->
    <div class="px-4 py-16 mx-auto sm:max-w-xl md:max-w-full lg:max-w-screen-xl md:px-24 lg:px-8 lg:py-20">
      <div class="grid gap-8 lg:grid-cols-3 sm:max-w-sm sm:mx-auto lg:max-w-full">
        <PostCard 
          v-for="post in posts" 
          :key="post.id"
          :Titulo="post.Titulo"
          :Subtitulo="post.Subtitulo"
          :Imagen="post.Imagen"
          :Slug="post.Slug"
          :Autor="post.Autor"
          :date_created="post.date_created"
        />
      </div>
    </div>

    <!-- Newsletter Section -->
    <div class="bg-gray-900 py-16 my-16 rounded-2xl">
      <div class="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div class="mx-auto max-w-xl text-center">
          <h2 class="text-3xl font-bold tracking-tight text-white sm:text-4xl font-titulo">
            Suscríbete a nuestro newsletter
          </h2>

          <p class="mx-auto mt-4 max-w-lg text-base text-gray-300 font-texto">
            Recibe las últimas noticias y actualizaciones del sector directamente en tu correo.
          </p>

          <form class="mt-8 sm:flex sm:gap-4">
            <div class="sm:flex-1">
              <label for="email" class="sr-only">Email</label>
              <input
                type="email"
                placeholder="Introduce tu email"
                class="w-full rounded-md border-gray-700 bg-gray-800 p-3 text-white shadow-sm transition focus:border-white focus:outline-none focus:ring focus:ring-orange-400"
              />
            </div>

            <button
              type="submit"
              class="group mt-4 flex w-full items-center justify-center gap-2 rounded-md bg-orange-500 px-5 py-3 text-white transition hover:bg-orange-600 focus:outline-none focus:ring focus:ring-orange-400 sm:mt-0 sm:w-auto"
            >
              <span class="text-sm font-medium"> Suscribirse </span>

              <svg
                class="h-5 w-5 rtl:rotate-180"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  stroke-width="2"
                  d="M17 8l4 4m0 0l-4 4m4-4H3"
                />
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import PostCard from './PostCard.vue';

defineProps({
  posts: {
    type: Array,
    required: true
  }
});
</script>
