<template>
    <div>
        <section>
            <div class="bg-gray-50 min-h-28 flex flex-col sm:flex-row shadow">
                <div class="p-7 sm:w-1/2 min-w-0 border-b sm:border-b-0 sm:border-r">
                    <span class="block text-xs text-gray-500 pb-1 font-texto font-semibold">Inscripción Online</span>
                    <h2 class="font-titulo font-semibold text-2xl md:text-3xl text-orange-500 break-words">{{ curso.Titulo }}</h2>
                </div>
                <ul class="sm:w-1/2 p-7 space-y-2 text-right font-texto font-semibold text-sm text-gray-400">
                    <li>Estado: <span class="text-orange-400">{{ disponible ? 'Disponible' : 'No disponible' }}</span></li>
                    <li>Duración: <span class="text-orange-400">{{ curso.Duracion }}</span></li>
                    <li>Precio: <span class="text-orange-400">{{ curso.Precio }}€</span></li>
                    <li v-if="curso.Bonificado">Curso Bonificado</li>
                </ul>
            </div>
            <div class="container mt-10 mx-auto min-h-[60vh]">
                <button class="ml-5 text-gray-500 font-texto font-semibold" @click="$router.back()">← Volver</button>
                <h3 class="p-5 font-titulo font-semibold text-4xl text-orange-500 md:w-11/12 md:mx-auto md:px-2">Datos del alumno</h3>
                <form class="w-11/12 mx-auto p-2 bg-gray-50 border rounded mb-10" @submit.prevent="validarFormulario" @invalid.capture="validarCampos">
                    <h5 class="pl-3 font-titulo font-semibold text-lg text-orange-400 mt-2">Datos personales</h5>
                    <div v-for="campo in campos" :key="campo.nombre" class="flex flex-col p-3">
                        <label class="mb-2 font-titulo font-semibold text-gray-500" :for="campo.nombre">{{ campo.etiqueta }}</label>
                        <input :id="campo.nombre" v-model="datos[campo.nombre]" :name="campo.nombre" :type="campo.tipo" :maxlength="campo.max" :autocomplete="campo.autocomplete" :placeholder="campo.placeholder" required :aria-invalid="!!errores[campo.nombre]" :aria-describedby="errores[campo.nombre] ? `${campo.nombre}-error` : undefined" class="font-texto font-semibold text-gray-600 h-10 px-2 focus:outline-none focus:ring-1 focus:ring-orange-300 rounded min-w-0">
                        <p v-if="errores[campo.nombre]" :id="`${campo.nombre}-error`" class="mt-1 text-sm text-red-700">{{ errores[campo.nombre] }}</p>
                    </div>
                    <p v-if="errorPago" role="alert" class="px-3 pb-3 text-red-700">{{ errorPago }}</p>
                    <p v-if="!disponible" class="px-3 pb-3 text-gray-600">Este curso no está disponible para inscripciones.</p>
                    <div class="flex justify-center p-3">
                        <button type="submit" :disabled="pagando || !disponible" class="disabled:bg-gray-400 bg-orange-500 px-5 py-3 rounded font-titulo font-semibold text-white text-xl">{{ pagando ? 'Preparando el pago…' : 'Inscribirme en el curso' }}</button>
                    </div>
                </form>
                <form ref="redsysForm" name="pasarelaPago" action="https://sis.redsys.es/sis/realizarPago" method="POST" hidden>
                    <input type="hidden" name="Ds_SignatureVersion" :value="firma.Ds_SignatureVersion">
                    <input type="hidden" name="Ds_MerchantParameters" :value="firma.Ds_MerchantParameters">
                    <input type="hidden" name="Ds_Signature" :value="firma.Ds_Signature">
                </form>
            </div>
        </section>
    </div>
</template>

<script setup>
import { validarDatosAlumno } from '~~/shared/utils/datosAlumno';

const ruta = useRoute();
const { stock, datos, getStock } = useCheckout();
const { curso, getCursoData } = useCursoData();
const { enviarEcommerce, itemCurso } = useDataLayer();
const redsysForm = ref(null);
const firma = ref({});
const pagando = ref(false);
const errores = ref({});
const errorPago = ref('');
const campos = [
    { nombre: 'Nombre', etiqueta: 'Dinos tu nombre', tipo: 'text', max: 100, autocomplete: 'given-name', placeholder: 'Tu nombre…' },
    { nombre: 'Apellidos', etiqueta: 'Y tus apellidos', tipo: 'text', max: 150, autocomplete: 'family-name', placeholder: 'Tus apellidos…' },
    { nombre: 'Telefono', etiqueta: 'Un teléfono para contactar contigo', tipo: 'tel', max: 30, autocomplete: 'tel', placeholder: 'Ej: 931234567' },
    { nombre: 'Email', etiqueta: 'Tu correo para registrarte como alumno', tipo: 'email', max: 254, autocomplete: 'email', placeholder: 'Tu email' },
    { nombre: 'NieNif', etiqueta: 'Finalmente tu DNI (o NIE)', tipo: 'text', max: 9, autocomplete: 'off', placeholder: 'DNI o NIE' },
];
if (typeof ruta.query.curso !== 'string') throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' });
await getCursoData(ruta.query.curso);
if (!curso.value?.id) throw createError({ statusCode: 404, statusMessage: 'Curso no encontrado' });
await getStock(ruta.query.curso);
const disponible = computed(() => curso.value?.Activo === true && Number(stock.value) >= 1 && Number(curso.value?.Precio) > 0);

const validarCampos = () => {
    const resultado = validarDatosAlumno(datos);
    errores.value = resultado.errores;
    return resultado;
};
const validarFormulario = async () => {
    if (pagando.value || !disponible.value) return;
    const resultado = validarCampos();
    if (!resultado.valido) return;
    pagando.value = true;
    errorPago.value = '';
    try {
        firma.value = await $fetch('/api/pago/firmar', {
            method: 'POST', body: { curso: ruta.query.curso, origen: window.location.origin, alumno: resultado.datos },
        });
        await nextTick();
        enviarEcommerce('add_payment_info', {
            transaction_id: firma.value.pedido, value: Number(firma.value.precio),
            payment_type: 'Tarjeta (Redsys)', items: [itemCurso({ ...curso.value, Precio: firma.value.precio })],
        }, () => redsysForm.value.submit());
    } catch (error) {
        errores.value = error.data?.data?.campos || {};
        errorPago.value = error.data?.statusMessage || 'No se ha podido iniciar el pago. Inténtalo de nuevo o contacta con nosotros.';
        pagando.value = false;
    }
};
onMounted(() => {
    if (disponible.value) enviarEcommerce('begin_checkout', {
        value: Number(curso.value.Precio), items: [itemCurso(curso.value)],
    });
});
</script>
