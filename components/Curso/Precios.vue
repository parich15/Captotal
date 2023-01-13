<template>
 <div class="p-4 xl:w-3/5 md:w-3/4 w-full mx-auto group">
        <div class="h-full p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden group-hover:border-orange-500/60 transition">
          <h2 class="text-sm tracking-widest title-font mb-1 font-semibold font-texto text-gray-400 uppercase">{{Titulo}}</h2>
          <h1 class="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200 font-texto">
            <span>{{Precio}}</span>
            <span class="text-xl ml-1 font-normal text-gray-500">€</span>
          </h1>
          <p class="flex items-center mb-2 text-gray-500 group-hover:text-gray-700 font-texto" v-for="Contenido in Contenidos" :key="Contenido.id">
            <span class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400/20 text-white rounded-full flex-shrink-0 group-hover:bg-orange-500 group-hover:animate-pulse transition-all">
              <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" class="w-3 h-3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </span>{{Contenido.Contenido}}
          </p>
          <button v-if="disponible" class="flex items-center mt-16 md:mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded group-hover:scale-105 group-hover:bg-orange-500 transition font-texto" @click="$emit('initCheckout')">Inscribirme ahora
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-auto" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
          <button v-else class="flex items-center mt-16 md:mt-auto text-white bg-gray-400 border-0 py-2 px-4 w-full disabled font-texto rounded cursor-default"> Sin plazas
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-auto w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
            </svg>  
          </button>
          <p class="text-xs text-gray-500 mt-3 ml-1">{{Frase}}</p>
        </div>
      </div>
</template>

<script setup>
const { getItems } = useDirectusItems();
//Props
const props = defineProps({
  id: {
    type: Number,
    default: 0,
  },
  Titulo: {
    type: String,
    default: 'Titulo Curso'
  },
  Precio:{
    type: String || Number, 
    default: "0"
  },
  Contenidos: {
    type: Array,
    default: []
  },
  Frase:{
    type: String, 
    default: "El mejor precio garantizado"
  }
})
//Emits
defineEmits(["initCheckout"]);
//Comprobamos disponibilidad
const disponible = ref(true);
const comprobarDisponibilidad = async () => {
 try {
  const res = await getItems({
    collection: 'Cursos/'+ props.id,
    params:{
      fields: 'Aforo'
    }
  });
  if(res.Aforo <= 1){
    disponible.value = false;
    return;
  }else{
    disponible.value = true;
  }
 } catch (error) {
  console.log(error);
 }
}

//Ejecutamos
onMounted(async ()=>{
  await comprobarDisponibilidad()
})
</script>
