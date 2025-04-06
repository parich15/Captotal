<template>
  <NuxtLink :to="`/blog/${Slug}`" class="group">
    <div class="p-4 md:w-full sm:mb-0 mb-6 transition duration-300 ease-in-out transform hover:-translate-y-1 hover:shadow-xl bg-white rounded-xl overflow-hidden shadow-md">
      <!-- Image Container -->
      <div class="rounded-lg h-64 overflow-hidden relative">
        <img 
          alt="Blog post thumbnail" 
          class="object-cover object-center h-full w-full transition duration-300 group-hover:scale-105" 
          :src="`https://admin.captotal.com/assets/${Imagen}`"
        >
        <div class="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      
      <!-- Content -->
      <div class="mt-6">
        <!-- Category Tag -->
        <span class="inline-block px-3 py-1 text-sm font-semibold text-orange-500 bg-orange-50 rounded-full mb-4">
          Blog
        </span>
        
        <!-- Title -->
        <h2 class="text-2xl font-bold title-font text-gray-800 mt-2 font-titulo group-hover:text-orange-500 transition duration-300">
          {{ Titulo }}
        </h2>
        
        <!-- Subtitle -->
        <p class="text-base leading-relaxed mt-3 text-gray-600 font-texto line-clamp-2">
          {{ Subtitulo }}
        </p>
        
        <!-- Author and Date -->
        <div class="flex items-center mt-6 border-t pt-4 border-gray-100">
          <div class="w-8 h-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold text-sm">
            {{ authorInitials }}
          </div>
          <div class="ml-3 flex-grow">
            <p class="text-sm font-semibold text-gray-700">{{ Autor }}</p>
            <p class="text-xs text-gray-500">{{ formatDate(date_created) }}</p>
          </div>
          <!-- Arrow Icon -->
          <svg class="w-6 h-6 text-orange-500 transform transition-transform duration-300 group-hover:translate-x-2" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M5 12h14"></path>
            <path d="M12 5l7 7-7 7"></path>
          </svg>
        </div>
      </div>
    </div>
  </NuxtLink>
</template>

<script setup>
const props = defineProps({
  Titulo: {
    type: String,
    required: true
  },
  Subtitulo: {
    type: String,
    required: true
  },
  Imagen: {
    type: String,
    required: true
  },
  Slug: {
    type: String,
    required: true
  },
  Autor: {
    type: String,
    required: true
  },
  date_created: {
    type: String,
    required: true
  }
});

const authorInitials = computed(() => {
  if (!props.Autor) return '';
  return props.Autor.split(' ')
    .map(name => name.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
});

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};
</script>
