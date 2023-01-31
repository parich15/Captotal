<template>
    <div>
        <Suspense>
        <section>
            <div class=" bg-gray-50 h-28 flex shadow">
                <div class="p-7 w-1/2 border-r-[1px]">
                
                    <h2 class="font-titulo font-semibold text-3xl text-orange-500 ">
                        <span class="block text-xs text-gray-500 pb-1 font-texto font-semibold">Inscripción Online</span>
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

                    <h3 class="p-5 font-titulo font-semibold text-4xl text-orange-500">Datos del alumno</h3>
                    <form class="w-11/12 mx-auto p-2 bg-gray-50 border rounded mb-10" action="hola">
                        <h5 class="pl-3 font-titulo font-semibold text-lg text-orange-400 mt-2">Datos personales</h5>
                        <div class="flex flex-col p-3">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Nombre" >Dinos tu nombre</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="text" name="Nombre" id="" placeholder="Tu nombre..." v-model="datos.Nombre">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Apellidos">Y tus apellidos</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="text" name="Apellidos" id="" placeholder="Tus apellidos..." v-model="datos.Apellidos">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Telefono">Un telefono para contactar contigo</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="number" name="Telefono" id="" placeholder="Ej: 93123456" v-model="datos.Telefono">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="Email">Tu correo para registrarte como alumno</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="text" name="Email" id="" placeholder="Tu Email" v-model="datos.Email">
                        </div>
                        <div class="flex flex-col p-3 ">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="NieNif">Finalmente tu DNI (o Nie)</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded mb-3" required  type="text" name="NieNif" placeholder="Dni o Nie" v-model="datos.NieNif">
                        </div>
                        <hr class="p-3">
                        <h5 class="pl-3 font-titulo font-semibold text-lg text-orange-400">Datos de pago</h5>
                        <div class="flex flex-col p-3">
                            <label class="mb-2 font-titulo font-semibold text-gray-500" for="NumTjt">Número Tarjeta</label>
                            <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="number" name="NumTjt" id="" placeholder="Ej: 4637382899123" v-model="datos.pago.NumTjt">
                        </div>
                        <div class="flex p-3 mb-5">
                            <div class="flex flex-col w-1/2 p-1">
                                <label class="mb-2 font-titulo font-semibold text-gray-500" for="FechaTjt">Fecha</label>
                                <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="text" name="FechaTjt" id="" placeholder="01/23" v-model="datos.pago.FechaTjt">
                            </div>
                            <div class="flex flex-col w-1/2 p-1">
                                <label class="mb-2 font-titulo font-semibold text-gray-500" for="CVC">Codigo Secreto</label>
                                <input class="font-texto font-semibold text-gray-600 h-10 pl-2 focus:outline-none focus:ring-1 focus:ring-orange-300 focus:scale-105 transition rounded" required type="number" name="CVC" id="" placeholder="123" v-model="datos.pago.Cvc">
                            </div>
                        </div>

                        <div class="flex justify-center mb-3">
                            <button class="disabled:bg-gray-400 bg-orange-500 w-2/3 h-10 rounded font-titulo font-semibold text-white text-xl focus:outline-none focus:scale-105 transition">Inscribirme en el curso</button>
                        </div>
                    </form>
                </div>
        </section>
    </Suspense>
    </div>
</template>

<script setup>
import { useCursoData } from '~~/composables/useCursoData';
import { useCheckout } from '~~/composables/useCheckout';

const ruta = useRoute();
const {stock, datos, getStock} = useCheckout();
const {curso, getCursoData} = useCursoData();

//Obtenemos Datos
await getCursoData(ruta.query.id)
await getStock(ruta.query.id);


//Mecanismo anti acceso por Url
onMounted(async ()=>{
    if(stock.value < 1){
        useRouter().push('/');
    }
})
</script>
