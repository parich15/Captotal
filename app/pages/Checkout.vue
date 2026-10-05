<template>
    <div>
        <section>
            <div class="bg-gray-50 h-28 flex shadow">
                <div class="p-7 w-1/2 border-r-[1px]">
                    <span class="block text-xs text-gray-500 pb-1 font-texto font-semibold">Inscripción Online</span>
                    <h2 class="font-titulo font-semibold text-2xl md:text-3xl text-orange-500 ">
                        {{ curso.Titulo }}
                    </h2>
                </div>
                <div class="w-1/2">
                    <ul class="flex flex-col h-full justify-around items-end mr-7">
                        <li>
                            <p class="font-texto font-semibold text-sm text-gray-400">
                                Status:
                                <span class="text-orange-400 font-titulo">
                                    {{ curso.Activo ? 'Disponible' : 'No disponible' }}
                                </span>
                            </p>
                        </li>
                        <li>
                            <p class="font-texto font-semibold text-sm text-gray-400">
                                Duración:
                                <span class="text-orange-400 font-titulo">
                                    {{ curso.Duracion }}
                                </span>
                            </p>
                        </li>
                        <li>
                            <p class="font-texto font-semibold text-sm text-gray-400">
                                Precio:
                                <span class="text-orange-400 font-titulo">
                                    {{ curso.Precio }}€
                                </span>
                            </p>
                        </li>
                        <li v-if="curso.Bonificado">
                            <p>Curso Bonificado</p>
                        </li>
                    </ul>
                </div>
            </div>

            <div class="container mt-10 mx-auto min-h-[60vh]">
                <div class="pl-5">
                    <button class="flex text-gray-200 items-center" @click="$router.back()">
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-auto h-5 mr-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M6.75 15.75L3 12m0 0l3.75-3.75M3 12h18" />
                        </svg>
                        <span class="font-texto font-semibold">
                            Volver
                        </span>
                    </button>
                </div>

                <h3 class="p-5 font-titulo font-semibold text-4xl text-orange-500 md:w-11/12 md:mx-auto md:px-2">Datos del alumno</h3>
                <div class="w-11/12 mx-auto p-2 bg-gray-50 border rounded mb-10">
                    <h5 class="pl-3 font-titulo font-semibold text-lg text-orange-400 mt-2">Datos personales</h5>
                    <div class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" for="Nombre" >Dinos tu nombre</label>
                        <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="text" name="Nombre" id="" placeholder="Tu nombre..." v-model="datos.Nombre">
                    </div>
                    <div class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" for="Apellidos">Y tus apellidos</label>
                        <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="text" name="Apellidos" id="" placeholder="Tus apellidos..." v-model="datos.Apellidos">
                    </div>
                    <div class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" for="Telefono">Un teléfono para contactar contigo</label>
                        <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="number" name="Telefono" id="" placeholder="Ej: 93123456" v-model="datos.Telefono">
                    </div>
                    <div class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" for="Email">Tu correo para registrarte como alumno</label>
                        <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="text" name="Email" id="" placeholder="Tu Email" v-model="datos.Email">
                    </div>
                    <div class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" for="NieNif">Finalmente tu DNI (o NIE)</label>
                        <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded mb-3" required  type="text" name="NieNif" placeholder="DNI o NIE" v-model="datos.NieNif">
                    </div>
                    <hr class="p-3">
                    <ClientOnly>
                        <form ref="redsys_form" name="pasarelaPago" action="https://sis.redsys.es/sis/realizarPago" method="POST">
                            <input type="hidden" name="Ds_SignatureVersion" :value="Ds_SignatureVersion"/>
                            <input type="hidden" name="Ds_MerchantParameters" :value="Ds_MerchantParameters"/>
                            <input type="hidden" name="Ds_Signature" :value="Ds_Signature"/>
                            <div class="flex justify-center mb-3">
                                <button @click.prevent="validarFormulario" :disabled="pagando" class="disabled:bg-gray-400 bg-orange-500 w-2/3 h-10 rounded font-titulo font-semibold text-white text-xl focus:outline-none focus:scale-105 lg:focus:scale-100 transition">Inscribirme en el curso</button>
                            </div>
                        </form>
                    </ClientOnly>
                </div>
            </div>
        </section>
    </div>
</template>

<script setup>
import { useCursoData } from '~/composables/useCursoData';
import { useCheckout } from '~/composables/useCheckout';

const ruta = useRoute();
const {stock, datos, getStock} = useCheckout();
const {curso, getCursoData} = useCursoData();
const { enviarEcommerce, itemCurso } = useDataLayer();
const redsys_form = ref(null);

//Obtenemos Datos
await getCursoData(ruta.query.curso);
await getStock(ruta.query.curso);

// Logica de Pago: el servidor fija el precio y firma la petición (la clave de Redsys no llega al navegador)
const Ds_MerchantParameters = ref(null);
const Ds_Signature = ref(null);
const Ds_SignatureVersion = ref(null);
const pagando = ref(false);

const comenzarPago = async () =>{
    pagando.value = true;
    try {
        const firma = await $fetch('/api/pago/firmar', {
            method: 'POST',
            body: {
                curso: ruta.query.curso,
                origen: window.location.origin,
                alumno: {
                    Nombre: datos.Nombre,
                    Apellidos: datos.Apellidos,
                    Email: datos.Email,
                    Telefono: datos.Telefono,
                    NieNif: datos.NieNif,
                }
            }
        });
        Ds_SignatureVersion.value = firma.Ds_SignatureVersion;
        Ds_MerchantParameters.value = firma.Ds_MerchantParameters;
        Ds_Signature.value = firma.Ds_Signature;
        await nextTick();
        redsys_form.value.submit();
    } catch (e) {
        console.log(e);
        pagando.value = false;
        alert('No se ha podido iniciar el pago. Inténtalo de nuevo o contacta con nosotros.');
    }
}

// Logica Marketing: Captamos Checkout Event
const track = ()=> {
    enviarEcommerce('begin_checkout', {
        value: Number(curso.value.Precio),
        items: [itemCurso(curso.value)]
    })
}

//Mecanismo anti acceso por Url
onMounted(async ()=>{
    if(stock.value < 1){
        useRouter().push('/');
    }
    track();
})

const validarFormulario = () => {
    if (!datos.Nombre || !datos.Apellidos || !datos.Telefono || !datos.Email || !datos.NieNif) {
        alert('Por favor, complete todos los campos.');
        return false;
    }
    // Si todo es correcto, continúa con el pago
    comenzarPago();
}
</script>