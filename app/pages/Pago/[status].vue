<template>
    <div class="container mx-auto min-h-[70vh] px-5 py-16 flex justify-center">
        <section class="w-full max-w-2xl min-w-0" aria-live="polite">
            <h1 class="font-titulo font-semibold text-3xl text-orange-500 mb-5">{{ titulo }}</h1>
            <p v-if="error" role="alert" class="text-gray-600 mb-5">{{ error }}</p>
            <template v-if="datos">
                <p v-if="datos.estado === 'pendiente'" class="mb-5 text-gray-600">Estamos esperando la confirmación del banco. Puedes actualizar el estado en unos instantes. Si el cargo ya aparece en tu cuenta, contacta con nosotros antes de volver a pagar.</p>
                <p v-if="datos.estado === 'denegado'" class="mb-5 text-gray-600">El banco ha rechazado la operación. Puedes contactar con nosotros para revisar tu inscripción.</p>
                <p v-if="datos.estado === 'autorizado' && datos.sincronizacion !== 'completa'" class="mb-5 text-gray-600">El pago está confirmado y estamos completando tu inscripción. Conserva el número de pedido; no necesitas volver a pagar.</p>
                <dl class="border rounded p-4 grid grid-cols-1 sm:grid-cols-[auto_minmax(0,1fr)] gap-x-5 gap-y-3 font-titulo font-semibold">
                    <dt class="text-gray-500">Número de pedido</dt><dd class="text-orange-500 break-words">{{ datos.Order.numOrder }}</dd>
                    <dt class="text-gray-500">Nombre</dt><dd class="text-orange-500 break-words">{{ datos.Nombre }}</dd>
                    <dt class="text-gray-500">Email</dt><dd class="text-orange-500 break-words">{{ datos.Email }}</dd>
                    <dt class="text-gray-500">Curso</dt><dd class="text-orange-500 break-words">{{ datos.NombreCurso }}</dd>
                    <dt class="text-gray-500">Precio</dt><dd class="text-orange-500">{{ datos.Order.precio }} €</dd>
                </dl>
            </template>
            <div class="flex flex-wrap gap-3 mt-6">
                <button v-if="!datos || datos.estado === 'pendiente' || datos.sincronizacion === 'error'" :disabled="cargando" class="p-3 border border-orange-500 text-orange-600 rounded-md font-titulo font-semibold disabled:opacity-50" @click="consultar(false)">{{ cargando ? 'Consultando…' : 'Actualizar estado' }}</button>
                <NuxtLink to="/" class="p-3 bg-orange-500 rounded-md text-white font-titulo font-semibold">Volver a inicio</NuxtLink>
            </div>
        </section>
    </div>
</template>

<script setup>
const ruta = useRoute();
const { enviarEcommerce, itemCurso } = useDataLayer();
const datos = ref(null);
const error = ref('');
const cargando = ref(false);
let temporizador;
let intentos = 0;
const titulo = computed(() => {
    if (!datos.value) return cargando.value ? 'Consultando el pago…' : 'Estado del pago';
    return { autorizado: 'Pago realizado con éxito', pendiente: 'Pago pendiente de confirmación', denegado: 'No se ha podido completar el pago' }[datos.value.estado];
});

// La marca se guarda únicamente cuando se puede emitir una compra autorizada con consentimiento.
const track = () => {
    if (datos.value?.estado !== 'autorizado') return;
    const clave = `captotal_purchase_${datos.value.Order.numOrder}`;
    try {
        if (localStorage.getItem('cookiesAceptadas') !== 'true' || localStorage.getItem(clave)) return;
        const enviado = enviarEcommerce('purchase', {
            transaction_id: datos.value.Order.numOrder, value: Number(datos.value.Order.precio),
            items: [itemCurso({ id: datos.value.Curso, Titulo: datos.value.NombreCurso, Tipo: datos.value.TipoCurso, Precio: datos.value.Order.precio })],
        });
        if (enviado === true) localStorage.setItem(clave, '1');
    } catch { /* Sin almacenamiento disponible no se emite una compra sin deduplicación. */ }
};
const consultar = async (conFirma = false) => {
    if (cargando.value) return;
    clearTimeout(temporizador);
    cargando.value = true;
    error.value = '';
    try {
        datos.value = await $fetch('/api/pago/confirmar', {
            method: 'POST', body: {
                order: ruta.query.order,
                ...(conFirma && ruta.query.Ds_MerchantParameters ? {
                    Ds_SignatureVersion: ruta.query.Ds_SignatureVersion,
                    Ds_MerchantParameters: ruta.query.Ds_MerchantParameters,
                    Ds_Signature: ruta.query.Ds_Signature,
                } : {}),
            },
        });
        track();
        if (datos.value.estado === 'pendiente' && intentos++ < 6) temporizador = setTimeout(() => consultar(false), 5000);
    } catch {
        error.value = 'No podemos consultar este pedido. Usa el navegador con el que iniciaste el pago o contacta con nosotros con tu número de pedido.';
    } finally { cargando.value = false; }
};
useHead({ title: 'Estado del pago' });
onMounted(() => {
    consultar(true);
    // Permite registrar la compra si el consentimiento se concede después de consultar un pago pendiente.
    window.addEventListener('storage', track);
    window.addEventListener('captotal:consentimiento', track);
});
onBeforeUnmount(() => {
    clearTimeout(temporizador);
    window.removeEventListener('storage', track);
    window.removeEventListener('captotal:consentimiento', track);
});
</script>
