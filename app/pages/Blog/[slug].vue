<template>
  <main class="bg-gray-50 overflow-hidden">
    
    <div v-if="!post" class="container mx-auto px-4 py-16 text-center">
      <h1 class="text-2xl font-bold text-gray-800 mb-4 font-titulo">Cargando...</h1>
      <p class="text-gray-600 mb-8 font-texto">Espera un momento mientras cargamos el artículo.</p>
    </div>
    
    <template v-else>
      <!-- Hero Section -->
      <suspense>
        <Portada
          :Imagen="post?.Imagen"
          :Titulo="post?.Titulo"
          :Subtitulo="post?.Subtitulo"
          :Texto="''"
          :Landing="true"
        />
      </suspense>
      <Breadcrumbs :postTitle="post?.Titulo" />
      
      <!-- Post Content -->
      <PostContent
        :Autor="post?.Autor"
        :date_created="post?.date_created"
        :Contenido="post?.Contenido"
      />
      
      <!-- Related Posts -->
      <section v-if="posts && posts.length > 0" class="container mx-auto px-5 py-16">
        <div class="max-w-3xl mx-auto">
          <h2 class="text-2xl font-semibold text-gray-700 mb-8 font-titulo">Artículos relacionados</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div v-for="relatedPost in relatedPosts" :key="relatedPost.id" class="bg-white rounded-lg shadow-sm overflow-hidden">
              <div class="h-48 overflow-hidden">
                <img :src="`https://admin.captotal.com/assets/${relatedPost.Imagen}`" alt="Imagen del artículo" class="w-full h-full object-cover">
              </div>
              <div class="p-4">
                <h3 class="text-lg font-semibold text-gray-700 font-titulo">{{ relatedPost.Titulo }}</h3>
                <p class="text-gray-500 mt-2 text-sm line-clamp-2">{{ relatedPost.Subtitulo }}</p>
                <NuxtLink :to="`/blog/${relatedPost.Slug}`" class="text-orange-500 inline-flex items-center mt-3 hover:underline">
                  Leer ahora
                  <svg class="w-4 h-4 ml-2" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14"></path>
                    <path d="M12 5l7 7-7 7"></path>
                  </svg>
                </NuxtLink>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      <Ventajas />
    </template>
  </main>
</template>

<script setup>
import { useBlogData } from '~/composables/useBlogData';
import Breadcrumbs from '~/components/Blog/Breadcrumbs.vue';
import Portada from '~/components/Generales/Portada.vue';
import PostContent from '~/components/Blog/PostContent.vue';
import Ventajas from '~/components/Inicio/Ventajas.vue';

const ruta = useRoute();
const { post, posts, getPostData, getAllPosts } = useBlogData();

await getPostData(ruta.params.slug);
await getAllPosts();

// Get related posts (excluding current post)
const relatedPosts = computed(() => {
  if (!posts.value || !post.value) return [];
  return posts.value
    .filter(p => p.id !== post.value.id)
    .slice(0, 3);
});

watchEffect(() => {
  if (post.value) {
    useHead({
      title: post.value.Titulo + ' | Cap Total',
      meta: [
        {
          name: 'title',
          content: post.value.Titulo + ' | Cap Total'
        },
        {
          name: 'description',
          content: post.value.Subtitulo
        },
        {
          property: 'og:title',
          content: post.value.Titulo + ' | Cap Total'
        },
        {
          property: 'og:description',
          content: post.value.Subtitulo
        },
        {
          property: 'og:image',
          content: post.value.Imagen ? `https://admin.captotal.com/assets/${post.value.Imagen}` : ''
        }
      ]
    });
  }
});
</script>
