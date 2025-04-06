<template>
  <article class="container mx-auto px-5 py-8">
    <div class="max-w-3xl mx-auto">
      <!-- Author and Date -->
      <div class="flex items-center mb-6">
        <div class="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-bold">
          {{ authorInitials }}
        </div>
        <div class="ml-3">
          <p class="text-gray-700 font-semibold font-texto">{{ Autor }}</p>
          <p class="text-gray-500 text-sm font-texto">{{ formatDate(date_created) }}</p>
        </div>
      </div>

      <!-- Content -->
      <div class="prose prose-lg max-w-none font-texto" v-html="Contenido"></div>
    </div>
  </article>
</template>

<script setup>
const props = defineProps({
  Autor: {
    type: String,
    required: true
  },
  date_created: {
    type: String,
    required: true
  },
  Contenido: {
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

<style scoped>
.prose img {
  border-radius: 0.5rem;
  margin: 2rem auto;
}

.prose h2 {
  font-family: var(--font-titulo);
  color: #374151;
  font-weight: 600;
  margin-top: 2rem;
  margin-bottom: 1rem;
}

.prose h3 {
  font-family: var(--font-titulo);
  color: #4B5563;
  font-weight: 500;
  margin-top: 1.5rem;
  margin-bottom: 0.75rem;
}

.prose p {
  margin-bottom: 1.25rem;
  line-height: 1.7;
}

.prose a {
  color: #F97316;
  text-decoration: underline;
}

.prose ul, .prose ol {
  margin-left: 1.5rem;
  margin-bottom: 1.25rem;
}

.prose li {
  margin-bottom: 0.5rem;
}
</style>
