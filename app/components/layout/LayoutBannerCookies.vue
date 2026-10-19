<template>
    <ClientOnly>
        <div id="bannerCookie" class="w-full fixed bottom-5 z-[9999]" v-if="mostrar" role="dialog" aria-labelledby="cookies-titulo" @keydown.esc="cerrar">
            <div class="p-3 w-10/12 lg:w-6/12 mx-auto bg-orange-500 rounded-lg shadow-lg">
                <h2 id="cookies-titulo" class="font-titulo font-bold text-white mb-2">Configurar cookies</h2>
                <div class="texto text-justify font-texto font-semibold text-white text-xs" v-html="textoPolitica"></div>
                <p class="text-white text-xs mt-2" v-if="decision !== null">Estado actual: {{ decision ? 'aceptadas' : 'rechazadas' }}.</p>
                <div class="flex flex-col md:flex-row gap-2 mt-4">
                    <div class="flex gap-2 w-full md:w-2/3">
                        <button ref="primerBoton" @click="guardar(true)" class="bg-white rounded-lg py-2 px-4 font-titulo font-semibold w-1/2 hover:text-orange-400 transition-all">Aceptar</button>
                        <button @click="guardar(false)" class="bg-gray-700 text-white rounded-lg py-2 px-4 font-titulo font-semibold w-1/2 hover:bg-gray-800 transition-all">Rechazar</button>
                    </div>
                    <div class="w-full md:w-1/3 text-center">
                        <NuxtLink to="/politica-de-cookies" class="font-titulo font-semibold text-white hover:underline">Ver Política de Cookies</NuxtLink>
                    </div>
                </div>
                <button v-if="decision !== null" @click="cerrar" class="text-white underline text-sm mt-3">Cerrar</button>
                <p v-if="error" role="alert" class="text-white text-sm mt-2">{{ error }}</p>
            </div>
        </div>
    </ClientOnly>
</template>

<script setup>
import { usePageData } from '~/composables/usePageData';
import { actualizarConsentimientoGoogle, eliminarCookiesAnaliticas } from '~/composables/useConsentimientoCookies';

const { getBloquesSections } = usePageData();
const data = await getBloquesSections(3);
const textoPolitica = computed(() => data?.Contenido?.[0]?.Content?.[0]?.item?.Texto || 'Puedes aceptar o rechazar las cookies de analítica y publicidad. Las cookies necesarias permiten el funcionamiento de la web.');
const { enviarPaginaVista } = useDataLayer();
const mostrar = ref(false);
const decision = ref(null);
const error = ref('');
const primerBoton = ref(null);
let focoAnterior;

const abrir = async () => {
    focoAnterior = document.activeElement;
    mostrar.value = true;
    await nextTick();
    primerBoton.value?.focus();
};
const cerrar = () => {
    if (decision.value === null) return;
    mostrar.value = false;
    focoAnterior?.focus();
};
const guardar = (aceptadas) => {
    const revocadas = decision.value === true && !aceptadas;
    try {
        localStorage.setItem('cookiesAceptadas', String(aceptadas));
    } catch {
        error.value = 'No se pudo guardar tu elección. Revisa el almacenamiento de tu navegador.';
        return;
    }
    decision.value = aceptadas;
    actualizarConsentimientoGoogle(aceptadas);
    window.dispatchEvent(new CustomEvent('captotal:consentimiento', { detail: { aceptadas } }));
    cerrar();
    if (aceptadas) {
        window.cargarGTM?.();
        enviarPaginaVista();
    } else {
        eliminarCookiesAnaliticas();
        if (revocadas) window.location.reload();
    }
};

onMounted(() => {
    try {
        const guardada = localStorage.getItem('cookiesAceptadas');
        decision.value = guardada === 'true' ? true : guardada === 'false' ? false : null;
    } catch { /* Si no hay almacenamiento disponible, se mantiene la elección pendiente. */ }
    if (decision.value === null) abrir();
    window.addEventListener('captotal:configurar-cookies', abrir);
});
onBeforeUnmount(() => window.removeEventListener('captotal:configurar-cookies', abrir));
</script>

<style>
#bannerCookie .texto > * > a {
    font-weight: bold;
}
</style>
