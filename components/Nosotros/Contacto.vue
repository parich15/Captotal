<template>
<section id="contacto" class="text-gray-600 body-font relative">
  <div class="container px-5 py-24 mx-auto flex sm:flex-nowrap flex-wrap lg:w-5/6">
    <div class="lg:w-2/3 md:w-1/2 bg-gray-300 rounded-lg overflow-hidden sm:mr-10 p-10 flex items-end justify-start relative group">
      <iframe width="100%" height="100%" class="absolute inset-0 grayscale contrast-125 opacity-40 hover:filter-none hover:opacity-100 transition-all duration-300" frameborder="0" title="map" marginheight="0" marginwidth="0" scrolling="no" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2995.5669716098914!2d2.143630915356026!3d41.34002870689268!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x12a4a1ffe87d3655%3A0xb3b93be85fa7596b!2sCap%20Total%20S.L!5e0!3m2!1ses!2ses!4v1667710652322!5m2!1ses!2ses" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
      <div class="bg-white relative flex flex-wrap py-6 rounded shadow-md opacity-100 group-hover:opacity-0 transition duration-500 ease-in-out ">
        <div class="lg:w-1/2 px-6">
          <h2 class="title-font font-semibold text-gray-900 tracking-widest text-xs">DIRECCIÓN</h2>
          <p class="mt-1 font-texto">{{ data.Calle }}</p>
          <p class="mt-1 font-texto text-xs lg:text-base" v-if="data.Calle_2 != null">{{ data.Calle_2 }}</p>
        </div>
        <div class="lg:w-1/2 px-6 mt-4 lg:mt-0">
          <h2 class="title-font font-semibold text-gray-900 tracking-widest text-xs">EMAIL</h2>
          <a class="text-orange-500 leading-relaxed font-texto">{{data.Email}}</a>
          <h2 class="title-font font-semibold text-gray-900 tracking-widest text-xs mt-4">TELÉFONOS</h2>
          <p class="leading-relaxed font-texto mt-1">{{data.Telefono}}</p>
          <p class="leading-relaxed font-texto" v-if="data.Movil">{{data.Movil}}</p>

        </div>
      </div>
    </div>
    <!-- FORM -->
    <div class="lg:w-1/3 md:w-1/2  flex flex-col md:ml-auto w-full md:py-8 mt-8 md:mt-0">
      <h2 class=" mb-1 font-titulo font-semibold text-3xl text-orange-500">Contacta con nosotros</h2>
      <p class="leading-relaxed mb-5 text-gray-600 font-texto">Nos pondremos en contacto contigo cuanto antes!</p>
      <form @submit="enviarForm">
        <div class="relative mb-4">
        <label for="Nombre" class="leading-7 text-sm text-gray-600 font-titulo">Nombre</label>
        <input v-model="Nombre" type="text" id="Nombre" name="Nombre" class="w-full bg-white rounded border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <div class="relative mb-4">
        <label for="Email" class="leading-7 text-sm text-gray-600 font-titulo">Email</label>
        <input v-model="Email" type="email" id="Email" name="Email" class="w-full bg-white rounded border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <div class="relative mb-4">
        <label for="Telefono" class="leading-7 text-sm text-gray-600 font-titulo">Teléfono</label>
        <input v-model="Telefono" type="number" id="Telefono" name="Telefono" class="w-full bg-white rounded border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 text-base outline-none text-gray-700 py-1 px-3 leading-8 transition-colors duration-200 ease-in-out">
      </div>
      <div class="relative mb-4">
        <p for="Tipo" class="leading-7 text-sm text-gray-600 font-titulo">Contacto como</p>
        <div class="flex justify-evenly">
          <div>
             <input v-model="Tipo" type="radio" id="Empresa" name="Tipo" class=" h-4 w-4 border-gray-300  focus:ring-none" value="1">
              <label class="font-titulo ml-3" for="Empresa">Empresa</label>
          </div>
          <div>
            <input v-model="Tipo" type="radio" id="Particular" name="Tipo" class=" h-4 w-4 border-gray-300  focus:ring-none" value="2">
            <label class="font-titulo ml-3" for="Particular">Particular</label>
          </div>
        </div>
      </div>
      <div class="relative mb-4">
        <label for="message" class="leading-7 text-sm text-gray-600 font-titulo">Mensaje</label>
        <textarea v-model="Mensaje" id="message" name="message" class="w-full bg-white rounded border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 h-32 text-base outline-none text-gray-700 py-1 px-3 resize-none leading-6 transition-colors duration-200 ease-in-out"></textarea>
      </div>
      <button type="submit" class=" w-full text-white bg-orange-400 border-0 py-2 px-6 focus:outline-none hover:bg-orange-500 rounded text-lg transition font-titulo font-semibold enabled:hover:scale-95  disabled:hover:bg-gray-200 disabled:bg-gray-200" :disabled="comprobacionCampos">
       <span v-if="!Cargando">
        Enviar
       </span> 
       <span v-else>
        Enviando
       </span> 
      </button>
        <p class="my-2 font-texto text-orange-500" v-if="Enviado">Enviado correctamente</p>
        <p class="text-sm text-red-500" v-if="Error">Ha habido un error, si el error persiste, contacta con nostros por <a href="mailto:info@captotal.com" class="font-semibold underline">email.</a></p>
        <p class="text-xs text-gray-500 mt-3 font-texto font-light">No utilizamos los datos para fines comerciales, tan solo para contactar contigo.</p>
      </form>
    </div>
  </div>
</section>
</template>

<script setup>
import { useContactoData } from '~~/composables/useContactoData';
const { createItems } = useDirectusItems();
const { createNotification } = useDirectusNotifications();
const { getItems } = useDirectusItems();
const {data, getContactoData} = useContactoData()
const runtimeConfig = useRuntimeConfig();

await getContactoData(1);

//Datos Form
const Cargando  = ref(false);
const Enviado   = ref(false);
const Error     = ref(false);
const Nombre    = ref(null);
const Email     = ref(null);
const Telefono  = ref(null);
const Tipo      = ref(null);
const Mensaje   = ref(null);

const enviarForm = async (evt) => {
  evt.preventDefault();
  Cargando.value = true;
  Error.value = false;

  try {
    let items = {
        Nombre: Nombre.value,
        Email: Email.value,
        Telefono: Telefono.value.toString(),
        Tipo: Tipo.value,
        Mensaje: Mensaje.value
      }
    
    await createItems({collection:"Mensajes",items});
    let id = await getItems({
      collection:"Mensajes",
      params:{
        fields: "id",
        sort: "-id",
        limit: 1,
        access_token: runtimeConfig.adminToken
      }
    })
    await createNotification({
      notification:{
        status: "inbox",
        recipient: "24d09644-0c69-40da-a599-c003af59033a",
        subject: "Nuevo Mensaje",
        message: "Hay un nuevo mensaje en la colección de mensajes",
        collection: "Mensajes",
        item: id[0].id
      }
    })

    Cargando.value = false;
    Enviado.value = true;
    setTimeout(()=>{
      Enviado.value = false,
      Nombre.value = null,
      Email.value  = null,
      Telefono.value = null,
      Tipo.value = null,
      Mensaje.value = null
    },1500)

  } catch (e) {
    Cargando.value = false;
    Error.value = true;
  }
}

const comprobacionCampos = computed(()=>{
  if(Nombre.value != null && Email.value != null && Telefono.value != null && Tipo.value != null){
    return false
  }else{
    return true
  }
})
</script>

<style>
.mensaje-enter-from,
.mensaje-leave-to{
  opacity: 0;
  transform: translateX(-15px);
}
.mensaje-enter-to,
.mensaje-leave-from {
  opacity: 1;
  transform: translateX(0);
}
.mensaje-enter-active,
.mensaje-leave-active{
  transition: all 300ms;
}

/* Chrome, Safari, Edge, Opera */
input::-webkit-outer-spin-button,
input::-webkit-inner-spin-button {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
}

/* Firefox */
input[type=number] {
  appearance: textfield;
  -moz-appearance: textfield;
}
</style>