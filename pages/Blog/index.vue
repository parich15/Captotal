<template>
  <main class="bg-gray-50">
    <!-- Blog Grid with Posts -->
    <PostGrid :posts="posts" />

    <!-- Categories Section -->
    <section class="bg-white py-16">
      <div class="container mx-auto px-4">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <!-- Transporte -->
          <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 4H6a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-2m-4-1v8m0 0l3-3m-3 3L9 8m-5 5h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 00.707.293h3.172a1 1 0 00.707-.293l2.414-2.414a1 1 0 01.707-.293H20" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2 font-titulo">Transporte</h3>
            <p class="text-gray-600 font-texto">Noticias y actualizaciones sobre el sector del transporte y logística.</p>
          </div>

          <!-- Formación -->
          <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path d="M12 14l9-5-9-5-9 5 9 5z" />
                <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14zm-4 6v-7.5l4-2.222" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2 font-titulo">Formación</h3>
            <p class="text-gray-600 font-texto">Recursos educativos y novedades sobre formación profesional.</p>
          </div>

          <!-- Normativa -->
          <div class="bg-gray-50 rounded-xl p-8 hover:shadow-lg transition duration-300">
            <div class="w-12 h-12 bg-orange-100 rounded-xl flex items-center justify-center mb-4">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 class="text-xl font-bold text-gray-800 mb-2 font-titulo">Normativa</h3>
            <p class="text-gray-600 font-texto">Actualizaciones sobre regulaciones y normativas del sector.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Ventajas Section -->
    <Ventajas />
  </main>
</template>

<script setup>
import { useBlogData } from '~/composables/useBlogData';
import { useGtag } from 'vue-gtag-next';
import PostGrid from '~/components/Blog/PostGrid.vue';
import Ventajas from '~/components/Inicio/Ventajas.vue';

const ruta = useRoute();
const { posts, getAllPosts } = useBlogData();
const { pageview } = useGtag();

await getAllPosts();

pageview({ 
  page_title: 'Blog | Cap Total',
  page_path: ruta.path,
  page_location: ruta.fullPath
});

useHead({
  title: 'Blog | Cap Total',
  meta: [
    {
      hid: 'title',
      name: 'title',
      content: 'Blog | Cap Total'
    },
    {
      hid: 'description',
      name: 'description',
      content: 'Descubre las últimas novedades, consejos y artículos sobre el sector del transporte y la formación vial profesional.'
    },
    {
      hid: 'og:title',
      name: 'og:title',
      content: 'Blog | Cap Total'
    },
    {
      hid: 'og:description',
      name: 'og:description',
      content: 'Descubre las últimas novedades, consejos y artículos sobre el sector del transporte y la formación vial profesional.'
    },
  ]
});
</script>
