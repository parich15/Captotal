<template>
    <div>

        <section>
            <div class=" bg-gray-50 h-28 flex shadow">
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
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Apellidos">Y tus apellidos</label>
                            <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="text" name="Apellidos" id="" placeholder="Tus apellidos..." v-model="datos.Apellidos">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Telefono">Un teléfono para contactar contigo</label>
                            <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="number" name="Telefono" id="" placeholder="Ej: 93123456" v-model="datos.Telefono">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Email">Tu correo para registrarte como alumno</label>
                            <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded" required type="text" name="Email" id="" placeholder="Tu Email" v-model="datos.Email">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="NieNif">Finalmente tu DNI (o NIE)</label>
                            <input class="focus:placeholder:text-transparent font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 lg:focus:scale-100 transition rounded mb-3" required  type="text" name="NieNif" placeholder="DNI o NIE" v-model="datos.NieNif">
                        </div>
                        <hr class="p-3">
                        <ClientOnly>
                            <form ref="redsys_form" name="pasarelaPago" action="https://sis.redsys.es/sis/realizarPago" method="POST">
                                <input type="hidden" name="Ds_SignatureVersion" v-model="Ds_SignatureVersion"/>
                                <input type="hidden" name="Ds_MerchantParameters" v-model="Ds_MerchantParameters"/>
                                <input type="hidden" name="Ds_Signature" v-model="Ds_Signature"/>
                                <!-- <button type="submit">TEST</button>  -->
                                <div class="flex justify-center mb-3">
                                    <button @click.prevent="comenzarPago" class="disabled:bg-gray-400 bg-orange-500 w-2/3 h-10 rounded font-titulo font-semibold text-white text-xl focus:outline-none focus:scale-105 lg:focus:scale-100 transition">Inscribirme en el curso</button>
                                </div>
                            </form>
                        </ClientOnly>
                    </div>

                </div>
        </section>

    </div>
</template>

<script setup>
import CryptoJS from 'crypto-js';
import { useCursoData } from '~~/composables/useCursoData';
import { useCheckout } from '~~/composables/useCheckout';
import { useGtag } from 'vue-gtag-next';

const ruta = useRoute();
const {stock, datos, getStock} = useCheckout();
const {curso, getCursoData} = useCursoData();
const {query} = useGtag();
const redsys_form = ref(null);

//Obtenemos Datos
await getCursoData(ruta.query.id);
await getStock(ruta.query.id);

// Logica de Pago
const fecha = new Date();
const Ds_MerchantParameters = ref(null);
const Ds_Signature = ref(null);
const Ds_SignatureVersion = "HMAC_SHA256_V1"
const cookie = useCookie('datosCliente', {
    maxAge: 86400,
    secure: true
});
const orderNumber = Math.floor(Math.random() * Date.now()).toString().slice(2,13);
const secret = 'TIVfhTviJ1b5sNRU/qMorrf+w56fpu5V';
const TPVinfo = {
  DS_MERCHANT_AMOUNT: '',
  DS_MERCHANT_CURRENCY: "978",
  DS_MERCHANT_MERCHANTCODE: '358281368',
  DS_MERCHANT_MERCHANTURL: "https://www.captotal.com/",
  DS_MERCHANT_ORDER: orderNumber,
  DS_MERCHANT_TERMINAL: "1",
  DS_MERCHANT_TRANSACTIONTYPE: "0",
  DS_MERCHANT_URLKO: `https://captotal.com/Pago/Fallido?status=ko`,
  DS_MERCHANT_URLOK: `https://captotal.com/Pago/Completo?status=ok&order=${orderNumber}`
};
// Lanzamos proceso de encriptacion y procedemos con la solicitud
const comenzarPago = async () =>{
    let encodedData = await encodePaymentInfo();
    if(encodedData){
        redsys_form.value.submit();
    }
}
// Codificamos Datos de Pago
const encodePaymentInfo = async () =>{
    try {
        // Codificamos Datos cliente
        await encodeDatosCliente();

        // Formateo Precio
        TPVinfo.DS_MERCHANT_AMOUNT = curso.value.Precio.toString() + '00';

        //Codifico Parametros en Base 64
        let TPVencoded = CryptoJS.enc.Utf8.parse(JSON.stringify(TPVinfo));
        Ds_MerchantParameters.value = TPVencoded.toString(CryptoJS.enc.Base64)
        
        // TripleDes + Merchant Order + Signature
        let key = CryptoJS.enc.Base64.parse(secret);
        let iv = CryptoJS.enc.Hex.parse("0000000000000000");
        let cipher = CryptoJS.TripleDES.encrypt(TPVinfo.DS_MERCHANT_ORDER,key,{
            iv: iv,
            mode:CryptoJS.mode.CBC,
            padding: CryptoJS.pad.ZeroPadding
        });

        let signature = CryptoJS.HmacSHA256(Ds_MerchantParameters.value, cipher.ciphertext);
        Ds_Signature.value = signature.toString(CryptoJS.enc.Base64);

        return true;
        
    } catch (e) {
        console.log(e)
    }
}
// Codificamos Datos de cliente y guardamos en almacenamiento de sesion
const encodeDatosCliente = async () => {
    try {
        datos.Curso = curso.value.id;
        datos.Order.numOrder = orderNumber;
        datos.NombreCurso = curso.value.Titulo;
        datos.Order.precio = curso.value.Precio;
        let a = CryptoJS.enc.Utf8.parse(JSON.stringify(datos)),
            b = a.toString(CryptoJS.enc.Base64);
        cookie.value = b;
        return; 
    } catch (error) {
        console.log(error);
    }
}


// Logica Marketing: Captamos Checkout Event

const track = ()=> {
    query("event", "begin_checkout", {
        currency: 'EUR',
        value: curso.value.Precio,
        items: [{
            item_id: `curso_${curso.value.id}`,
            item_name: curso.value.Titulo,
            item_category: curso.value.Tipo,
            quantity: 1
        }]
    })
}

//Mecanismo anti acceso por Url
onMounted(async ()=>{
    if(stock.value < 1){
        useRouter().push('/');
    }
    if(cookie.value){
        cookie.value = '';
    }
    track();
})
</script>
