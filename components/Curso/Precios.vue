<template>
 <div class="p-4 xl:w-3/5 md:w-3/4 w-full mx-auto group" id="Precios">
        <div class="h-auto p-6 rounded-lg border-2 border-gray-300 flex flex-col relative overflow-hidden group-hover:border-orange-500/60 transition">
          <h2 class="text-sm tracking-widest title-font mb-1 font-semibold font-texto text-gray-400 uppercase">{{Titulo}}</h2>
          <h4 class="text-5xl text-gray-900 leading-none flex items-center pb-4 mb-4 border-b border-gray-200 font-texto">
            <span v-if="Precio == '000'" class="text-xl mt-1 font-titulo font-semibold text-orange-500">Solicita más información</span>
            <div v-else>
              <span>{{Precio}}</span>
              <span class="text-xl ml-1 font-normal text-gray-500">€</span>
            </div>
          </h4>
          <p class="flex items-center mb-2 text-gray-500 group-hover:text-gray-700 font-texto" v-for="Contenido in Contenidos" :key="Contenido.id">
            <span class="w-4 h-4 mr-2 inline-flex items-center justify-center bg-gray-400/20 text-white rounded-full flex-shrink-0 group-hover:bg-orange-500 group-hover:animate-pulse transition-all">
              <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" class="w-3 h-3" viewBox="0 0 24 24">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
            </span>{{Contenido.Contenido}}
          </p>
          <div class="mt-16">
            <button v-if="stock >= 1 && carga == false && Precio !='000'" class="flex items-center md:mt-auto my-2 text-white bg-gray-400 border-0 py-2 px-4 w-full focus:outline-none hover:bg-gray-500 rounded group-hover:scale-105 group-hover:bg-orange-500 transition font-texto" @click="initCheckout">
            Inscribirme ahora
            <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" class="w-4 h-4 ml-auto group-hover:animate-pulse" viewBox="0 0 24 24">
              <path d="M5 12h14M12 5l7 7-7 7"></path>
            </svg>
          </button>
          <button v-else-if="carga == true" disabled class="flex items-center md:mt-auto my-2 text-white rounded border-0 py-2 px-4 w-full focus:outline-none bg-orange-500 transition font-texto">
            Comprobando disponibilidad
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-auto animate-spin">
              <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
          <button v-else class="flex items-center md:mt-auto my-2 text-white bg-gray-400 border-0 py-2 px-4 w-full disabled font-texto rounded cursor-default"> Sin plazas
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="ml-auto w-4 h-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M3 3l1.664 1.664M21 21l-1.5-1.5m-5.485-1.242L12 17.25 4.5 21V8.742m.164-4.078a2.15 2.15 0 011.743-1.342 48.507 48.507 0 0111.186 0c1.1.128 1.907 1.077 1.907 2.185V19.5M4.664 4.664L19.5 19.5" />
            </svg>  
          </button>
          <button v-if="carga == false" class="flex items-center md:mt-auto my-2 text-white rounded border-0 py-2 px-4 w-full focus:outline-none bg-gray-500 group-hover:bg-orange-400 transition font-titulo font-semibold" @click="toggleFormulario">
            Solicita información
            <!-- <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 ml-auto animate-pulse">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
            </svg> -->
          </button>
          <p class="text-xs text-gray-500 mt-3 ml-1">{{Frase}}</p>

          <!-- Form Contacto  -->
          <div class="border-t mt-3 block relative" >
            <Transition name="formulario">
              <div class="block" v-show="mostrarFormulario">
                <div class="flex flex-col flex-wrap mt-3" >
                <a href="tel:+34930107462" class="flex items-center w-full font-titulo  font-semibold text-white bg-orange-400 rounded py-2 px-4 tracking-wide sm:hidden">
                  <span>Llámanos e infórmate</span>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4 fill-white ml-auto">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 01-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 00-1.091-.852H4.5A2.25 2.25 0 002.25 4.5v2.25z" />
                    </svg>
                </a>
              
                <div class="pt-5 sm:pt-1 px-2">
                  <h3 class="font-titulo font-bold text-gray-500 text-2xl tracking-wide leading-6">  
                    Déjanos tus datos y nos pondremos en contacto!
                  </h3>
                  <form class="mt-3 flex flex-wrap" @submit="enviarForm">
                    <label class="font-titulo text-sm font-semibold text-gray-400 " for="Nombre">Dinos tu nombre</label>
                      <input required class="pt-1 w-full bg-gray-300 border-b-2 mb-1 border-gray-300 text-orange-400 focus:border-orange-400 focus:outline-none focus:bg-gray-200 font-titulo font-semibold  px-1" type="text" name="Nombre" v-model="userData.Nombre"> 
                    <label class="font-titulo text-sm font-semibold text-gray-400 mt-2" for="">Tu teléfono</label>
                      <input pattern="tel" required class="pt-1 w-full bg-gray-300 border-b-2 mb-1 border-gray-300 text-orange-400 focus:border-orange-400 focus:outline-none focus:bg-gray-200 font-titulo font-semibold  px-1" type="number" v-model="userData.Telefono">
                    <label class="font-titulo text-sm font-semibold text-gray-400 mt-2" for="">Y tu email</label>
                      <input required class="pt-1 w-full bg-gray-300 border-b-2 mb-1 border-gray-300 text-orange-400 focus:border-orange-400 focus:outline-none focus:bg-gray-200 font-titulo font-semibold  px-1" type="text" v-model="userData.Email">
                    <span class="text-xs mt-1 mb-2 text-gray-500">Los datos serán usados únicamente para contactar contigo y no se utilizarán para finalidades comerciales.</span>
                    <button v-if="!enviando" class="flex px-4 py-2 font-titulo text-white bg-orange-400 rounded font-semibold mt-2 disabled:bg-gray-500" :disabled="!formCompleto" type="submit">Enviar</button>
                    <button v-else class="flex px-4 py-2 font-titulo text-white bg-orange-400 rounded font-semibold mt-2">Enviando</button>
                  </form>
                  <Transition name="appear">
                  <div v-show="mensajeEnviado" class="font-titulo text-xl text-green-400 mt-3 -mb-2 text-center">
                    <p>Enviado correctamente</p>
                  </div>
                </Transition>
                </div>
              </div>
              </div>
              
            </Transition>
            </div>
          <!-- End Form -->

          </div>
        </div>
      </div>
</template>

<script setup>
import { useCheckout } from '~~/composables/useCheckout';
const { createItems } = useDirectusItems();
const { createNotification } = useDirectusNotifications();
const { getItems } = useDirectusItems();
const runtimeConfig = useRuntimeConfig();

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

//Datos
const ruta = useRoute();
//Comprobamos disponibilidad en carga y en checkout init
const {stock, carga,  getStock} = useCheckout();

const initCheckout = async () => {
  await getStock(ruta.params.slug);
  if(stock.value < 1){
    stock.value = false;
    return;
  }
  useRouter().push({ 
    path: "/Checkout",
    query: {
      curso: ruta.params.slug
    }
  })

}

// Formulario de Contacto
const mostrarFormulario = ref(false);
const toggleFormulario = () => mostrarFormulario.value = !mostrarFormulario.value;
const enviando = ref(false);
const mensajeEnviado = ref(false);
const userData = reactive({
  Nombre: null,
  Email: null,
  Telefono: null
});

const formCompleto = computed(()=>{
  if(
    userData.Nombre != null && userData.Nombre != "" && 
    userData.Email != null  && userData.Email != "" &&
    userData.Telefono != null && userData.Telefono != ""){
    return true;
  }else{
    return false;
  }
})

const enviarForm = async (e) =>{
  e.preventDefault();
  enviando.value = true;
  try {
    let items = [{
    Nombre: userData.Nombre,
    Email: userData.Email,
    Telefono: userData.Telefono,
    Curso: props.id,
    Centro: 1,
    Fecha: new Date()
    }];
    
    await createItems({
      collection: 'Interesados',
      items
    });
    let ids = await getItems({
      collection: "Interesados",
      params:{
        fields: "id",
        sort: "-id",
        limit: 1,
        access_token: runtimeConfig.notifications
      }
    })
    
    await createNotification({
      notification: {
        status: "inbox",
        recipient: "e64ad966-00f8-4a65-8461-f2debdde73e4",
        subject: "Nuevo interesado | Curso: "+ props.Titulo,
        message: `<p>Nuevo interesado en ${props.Titulo}</p>
                  <br>
                  <p>Nombre: ${userData.Nombre}</p>
                  <p>Telefono: ${userData.Telefono}</p>
                  <p>Email: ${userData.Email}</p>
                  `,
        collection: "Interesados",
        item: ids[0].id
      }
    });

    enviando.value = false;
    userData.Nombre = '', userData.Email = '', userData.Telefono = '';
    mostrarMensaje();
  } catch (error) {
    console.log(error)
  }
}

const mostrarMensaje = () => {
  mensajeEnviado.value = true;
  setTimeout(()=>{
    mensajeEnviado.value = false;
    mostrarFormulario.value = false;
  },2500)
}

//Ejecutamos
onMounted(async ()=>{
  await getStock(ruta.params.slug);
})
</script>

<style>
/* Transicion Formulario */
.formulario-enter-from,.formulario-leave-to {
  transform: translateY(-10px);
  opacity: 0;
}
.formulario-enter-to{
  opacity: 1;
  transform: translateY(0px);
}
.formulario-leave-from {
  opacity: .75;
  transform: translateY(0px);
}
.formulario-enter-active {
  transition: opacity 300ms ease-in ;
}
.formulario-leave-active{
  transition: all 150ms ease-out;
}

/* Transicion Mensaje */
.appear-enter-from,.appear-leave-to {
  opacity: 0;
}
.apperar-enter-to, .appear-leave-from{
  opacity: 1;
}
.appear-enter-active, .appear-leave-active{
  transition: opacity 200ms ease-in;
}

</style>