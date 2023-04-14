<template>
    <div class="container mx-auto w-full h-screen flex justify-center">
             <div class="flex flex-col justify-center items-center py-20" v-if="ruta.query.status == 'ok'">
            <div>
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-52 h-52 text-orange-500 animate-pulse transition">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
                </svg>
            </div>
        <Suspense>

            <div class="mt-20">
                <h1 class="font-titulo font-semibold text-3xl text-orange-500 py-1">Pago realizado con éxito</h1>
                <h3 class="font-titulo font-semibold text-gray-500 text-lg mb-4">Detalles de la compra</h3>
                <p class="text-xs font-texto font-semibold text-gray-300 p-1">
                    Número de pedido: 
                    <span>
                        {{datos.Order.numOrder}}
                    </span>
                </p>
               <div class="border rounded p-2 grid grid-cols-3">
                <ul class="mt-2 ml-2 font-titulo font-semibold text-lg  text-gray-500 grid-col-1 ">
                    <li class="my-2">
                        Nombre:
                    </li>
                    <li class="my-2">
                        Email:
                    </li>
                    <li class="my-2">
                        Curso: 
                    </li>
                    <li class="my-2">
                        Precio:
                    </li>
                </ul>
                <ul class="mt-2 font-titulo font-semibold text-lg  text-orange-500 grid-col-2 ">
                    <li class="my-2">
                       {{ datos.Nombre }}
                    </li>
                    <li class="my-2">
                        {{ datos.Email }}
                    </li>
                    <li class="my-2">
                        {{ datos.NombreCurso }}
                    </li>
                    <li class="my-2">
                        {{ datos.Order.precio }} €
                    </li>
                </ul>
               </div>
               
            </div>
        </Suspense>
            <p class="text-xs font-texto font-semibold text-gray-300 p-1 mx-10">
             Se ha enviado un correo con la información de la compra al email facilitado. Para cualquier información no dude en contactar con nosotros.
            </p>
            <button @click="$router.push('/')" class="p-3 font-titulo bg-orange-500 rounded-md mt-5 text-xl text-white font-semibold">
                Confirmar
            </button>
            </div>
            <div v-else>
                Lo sentimos, no se ha podido completar el pago.
                <button @click="$router.push('/')" class="p-3 font-titulo bg-orange-500 rounded-md mt-5 text-xl text-white font-semibold">
                Volver a Inicio
                </button>
            </div>
    </div>
</template>

<script setup>
import CryptoJs from 'crypto-js';
import { useGtag } from "vue-gtag-next";

const ruta = useRoute();
const {purchase} = useGtag();
const { createItems } = useDirectusItems();
const datos = ref(null);
const cookie = useCookie('datosCliente')


// Decodificamos Datos de Cliente
const decodeClientData = async () => {
    if(cookie.value == undefined){
        return;
    }

    let decrypt = CryptoJs.enc.Base64.parse(cookie.value);
    let utf = CryptoJs.enc.Utf8.stringify(decrypt);
    let datosCliente = JSON.parse(utf);
    datos.value = datosCliente;
    return;
    
}

// Trackeamos Evento Compra con sus datos y enviamos a Analytics
const track = () => {
      purchase({
        "transaction_id": datos.value.Order.numOrder,
        "value": parseInt(datos.value.Order.precio),
        "currency": "EUR",
        "shipping": 0,
        "items": [
            {
                "id": datos.value.Curso,
                "name": datos.value.NombreCurso,
                "category": "Cursos",
                "price": datos.value.Order.precio
            }
        ]
      })
}

const crearAlumno = async (datos) =>{
    let items = [{
        Nombre: datos.Nombre,
        Apellidos: datos.Apellidos,
        Email: datos.Email,
        Telefono: datos.Telefono,
        Nie: datos.NieNif,
        Numero_Pedido: datos.Order.numOrder,
        Curso: datos.Curso.toString(),
        Total: parseInt(datos.Order.precio)
    }];
    await createItems({
        collection: 'Alumnos',
        items
    })
}

await decodeClientData();

useHead({
    title: 'Pasarela de Pago'
})

onMounted(()=>{
    if(ruta.query.status == "ok"){
        nextTick(async ()=>{
            await crearAlumno(datos.value);
            track()
        })
    }
})

onBeforeRouteLeave(()=>{
    cookie.value = '';
})
</script>
