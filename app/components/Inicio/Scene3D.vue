<template>
  <div ref="host" class="scene-3d" :aria-label="label" role="group">
    <img v-if="!ready && fallbackImage" :src="fallbackImage" :alt="label" class="scene-fallback" />
    <canvas
      ref="canvas"
      class="scene-canvas"
      :class="{ 'is-ready': ready }"
      :style="{ cursor, touchAction }"
      aria-hidden="true"
      @pointermove="forwardPointer('move', $event)"
      @pointerdown="forwardPointer('down', $event)"
      @pointerup="forwardPointer('up', $event)"
      @pointercancel="forwardPointer('cancel', $event)"
      @pointerleave="forwardPointer('leave', $event)"
    />
    <div v-if="ready && kind === 'tachograph'" class="tacho-ui">
      <p class="tacho-hint" :class="{ 'is-alert': state.alert }" aria-hidden="true">
        <span class="tacho-dot" />
        <span class="tacho-hint-text">{{ state.hint }}</span>
        <span v-if="state.progress != null" class="tacho-meter"><span :style="{ transform: `scaleX(${Math.min(1, state.progress)})` }" /></span>
        <span v-if="state.demo" class="tacho-badge" title="Demostración a cámara rápida">{{ state.demo }}</span>
      </p>
      <div class="tacho-controls" role="group" aria-label="Controles del tacógrafo">
        <button type="button" class="tacho-btn tacho-btn--primary" :class="{ 'is-out': !state.cardInserted }" :aria-disabled="state.cardBusy ? 'true' : 'false'" :aria-label="state.cardInserted ? 'Extraer la tarjeta de la ranura 1' : 'Insertar la tarjeta en la ranura 1'" @click="action('card')">
          <svg v-if="state.cardInserted" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5 5 13h14Z" /><path d="M5 18h14" /></svg>
          <svg v-else viewBox="0 0 24 24" aria-hidden="true"><rect x="3" y="6" width="18" height="12" rx="2" /><path d="M6.5 10H10v4H6.5Z" /></svg>
          <span class="tacho-label">{{ state.cardInserted ? 'Extraer' : 'Insertar' }}<span class="tacho-label-long"> tarjeta</span></span>
        </button>
        <button type="button" class="tacho-btn" :aria-disabled="state.cardReady ? 'false' : 'true'" :aria-label="`Cambiar actividad con la tecla 1. Actual: ${(state.activityLabel || '').toLowerCase()}`" @click="action('activity')">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <template v-if="state.activity === 'drive'"><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 12v8.5" /></template>
            <path v-else-if="state.activity === 'avail'" d="M4 4h16v16H4ZM4 4l16 16" />
            <path v-else-if="state.activity === 'rest'" d="M3 5v14M3 14h18v5M6 10.5h4" />
            <path v-else d="M4 4h6M7 4l10 16M14 4h6M17 4 7 20" />
          </svg>
          <span class="tacho-label">{{ state.activityLabel }}</span>
        </button>
        <button type="button" class="tacho-btn" :aria-disabled="state.cardReady ? 'false' : 'true'" :aria-label="`Siguiente pantalla del tacógrafo. Actual: ${(state.screenLabel || '').toLowerCase()}`" @click="action('screen')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m7 10 5-5 5 5M7 14l5 5 5-5" /></svg>
          <span class="tacho-label">Pantalla</span>
        </button>
        <button type="button" class="tacho-btn" :aria-disabled="state.cardReady && !state.printing ? 'false' : 'true'" aria-label="Imprimir el informe diario de 24 horas" @click="action('print')">
          <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 9V4h10v5M7 17H4v-7h16v7h-3" /><path d="M7 14h10v6H7Z" /></svg>
          <span class="tacho-label">Imprimir</span>
        </button>
      </div>
      <p class="sr-only" role="status" aria-live="polite">{{ state.status }}</p>
    </div>
    <button v-if="ready" type="button" class="scene-toggle" :aria-label="`${paused ? 'Reanudar' : 'Pausar'} animación ${animationSubject}`" :aria-pressed="paused" @click="togglePause">
      <svg v-if="paused" viewBox="0 0 24 24" aria-hidden="true"><path d="m8 5 11 7-11 7Z" /></svg>
      <svg v-else viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5h4v14H7zM14 5h4v14h-4z" /></svg>
    </button>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, reactive, ref } from 'vue';

const props = defineProps({ kind: { type: String, required: true }, label: { type: String, required: true }, fallbackImage: { type: String, default: '' } });
const animationSubject = computed(() => ({ truck: 'del camión', tachograph: 'del tacógrafo', professionals: 'de los profesionales' }[props.kind] || 'de la escena'));
const host = ref(null);
const canvas = ref(null);
const ready = ref(false);
const paused = ref(false);
const cursor = ref('');
const touchAction = ref('pan-y');
// Estado que la escena publica con emit() para la interfaz superpuesta.
const state = reactive({});
const loaders = {
  truck: () => import('~/utils/scenes/truck.js'),
  tachograph: () => import('~/utils/scenes/tachograph.js'),
  professionals: () => import('~/utils/scenes/professionals.js'),
};
// Contrato de una escena: createScene({ invalidate, emit }) devuelve
// { scene, camera, resize(w, h), update(elapsed, delta, { paused }) → true si necesita más fotogramas,
//   setup?({ renderer, THREE }), pointer?(type, x, y, event) → { cursor }, action?(name), dispose?(), maxPixelRatio?, touchAction? }
let renderer, world, observer, preloadObserver, resizeObserver, motionQuery;
let disposed = false, initializing = false, failed = false, visible = false;
let frame = 0, previousTime = 0, elapsed = 0;

function releaseScene(scene) {
  const geometries = new Set(), materials = new Set(), textures = new Set();
  scene?.traverse(object => {
    if (object.geometry) geometries.add(object.geometry);
    for (const material of (Array.isArray(object.material) ? object.material : [object.material])) {
      if (!material) continue;
      materials.add(material);
      for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
      for (const uniform of Object.values(material.uniforms || {})) if (uniform?.value?.isTexture) textures.add(uniform.value);
    }
    object.shadow?.map?.dispose();
  });
  if (scene?.background?.isTexture) textures.add(scene.background);
  if (scene?.environment?.isTexture) textures.add(scene.environment);
  textures.forEach(texture => texture.dispose());
  materials.forEach(material => material.dispose());
  geometries.forEach(geometry => geometry.dispose());
}
function teardown() {
  world?.dispose?.(); releaseScene(world?.scene); world = null;
  renderer?.dispose(); renderer = null;
}
function stop() { cancelAnimationFrame(frame); frame = 0; previousTime = 0; }
function fail(error) {
  stop(); failed = true; ready.value = false;
  console.warn(`[Scene3D:${props.kind}] No se pudo mostrar la escena.`, error);
  teardown();
}
function paint(time) {
  frame = 0;
  if (disposed || failed || !world || !renderer) return;
  const delta = Math.min(previousTime ? (time - previousTime) / 1000 : 0, .25);
  previousTime = time;
  // El tiempo ambiental se congela en pausa; las interacciones siguen recibiendo delta real.
  if (!paused.value) elapsed += delta;
  let busy = false;
  try {
    busy = !!world.update(elapsed, delta, { paused: paused.value });
    renderer.render(world.scene, world.camera);
    ready.value = true;
  } catch (error) { fail(error); return; }
  if (visible && !document.hidden && (!paused.value || busy)) frame = requestAnimationFrame(paint);
  else previousTime = 0;
}
function sync() {
  if (frame) return;
  if (world && renderer && visible && !document.hidden) frame = requestAnimationFrame(paint);
}
function resize() {
  if (!renderer || !world || !host.value) return;
  const { width, height } = host.value.getBoundingClientRect();
  if (width <= 0 || height <= 0) return;
  renderer.setSize(width, height, false);
  world.resize(width, height);
  sync();
}
function emit(patch) { Object.assign(state, patch); }
async function initialize() {
  if (disposed || initializing || world || failed) return;
  initializing = true;
  try {
    if (!loaders[props.kind]) throw new Error('Tipo de escena desconocido');
    const [THREE, module] = await Promise.all([import('three'), loaders[props.kind]()]);
    if (disposed) return;
    world = module.default({ invalidate: sync, emit });
    renderer = new THREE.WebGLRenderer({ canvas: canvas.value, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, world.maxPixelRatio ?? 1.5));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    touchAction.value = world.touchAction || 'pan-y';
    world.setup?.({ renderer, THREE });
    resize();
  } catch (error) { if (!disposed) fail(error); }
  finally { initializing = false; }
}
function togglePause() { paused.value = !paused.value; sync(); }
function action(name) { world?.action?.(name); sync(); }
function forwardPointer(type, event) {
  if (!world?.pointer || !canvas.value) return;
  const rect = canvas.value.getBoundingClientRect();
  const x = (event.clientX - rect.left) / rect.width * 2 - 1;
  const y = 1 - (event.clientY - rect.top) / rect.height * 2;
  if (type === 'down') canvas.value.setPointerCapture?.(event.pointerId);
  const result = world.pointer(type, x, y, event);
  cursor.value = result?.cursor || '';
  sync();
}
function motionChanged(event) { paused.value = event.matches; sync(); }
function contextLost(event) { event.preventDefault(); fail(new Error('Contexto WebGL perdido')); }
onMounted(() => {
  motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
  paused.value = motionQuery.matches;
  motionQuery.addEventListener('change', motionChanged);
  document.addEventListener('visibilitychange', sync);
  canvas.value.addEventListener('webglcontextlost', contextLost);
  resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(host.value);
  observer = new IntersectionObserver(entries => {
    visible = entries[0].isIntersecting;
    if (visible) initialize();
    sync();
  }, { rootMargin: '-65px 0px 0px 0px' });
  observer.observe(host.value);
  // Prepara la GPU poco antes de que el panel entre en pantalla.
  preloadObserver = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) { initialize(); preloadObserver.disconnect(); }
  }, { rootMargin: '200px' });
  preloadObserver.observe(host.value);
});
onBeforeUnmount(() => {
  disposed = true; stop(); observer?.disconnect(); preloadObserver?.disconnect(); resizeObserver?.disconnect();
  motionQuery?.removeEventListener('change', motionChanged);
  document.removeEventListener('visibilitychange', sync);
  canvas.value?.removeEventListener('webglcontextlost', contextLost);
  renderer?.forceContextLoss();
  teardown();
});
</script>

<style scoped>
.scene-3d { position: relative; width: 100%; height: 100%; min-height: 20rem; overflow: hidden; background: #c9e3ed; }
.scene-canvas, .scene-fallback { position: absolute; inset: 0; display: block; width: 100%; height: 100%; }
.scene-fallback { object-fit: cover; object-position: left; }
.scene-canvas { opacity: 0; transition: opacity .4s ease; }
.scene-canvas.is-ready { opacity: 1; }
.scene-toggle { position: absolute; bottom: .875rem; right: .875rem; display: grid; place-items: center; width: 2.75rem; height: 2.75rem; border-radius: 50%; background: rgb(255 255 255 / .94); color: #253342; box-shadow: 0 2px 10px #25334226; }
.scene-toggle:hover { background: white; }
.scene-toggle:focus-visible { outline: 3px solid #f97316; outline-offset: 3px; }
.scene-toggle svg { width: 1rem; height: 1rem; fill: currentColor; }
.tacho-ui { position: absolute; inset: 0; pointer-events: none; container: tacho / inline-size; }
.tacho-hint { position: absolute; top: .75rem; left: .75rem; max-width: calc(100% - 1.5rem); display: flex; align-items: center; gap: .5rem; margin: 0; padding: .45rem .8rem .45rem .65rem; border-radius: 1rem; background: rgb(255 255 255 / .9); color: #253342; font: 700 .75rem/1.3 'Nunito', sans-serif; box-shadow: 0 2px 12px #2533421a; backdrop-filter: blur(6px); transition: background-color .3s, color .3s; }
.tacho-hint.is-alert { background: #fff1e6; color: #9a3412; }
.tacho-hint-text { display: -webkit-box; overflow: hidden; -webkit-line-clamp: 2; -webkit-box-orient: vertical; }
.tacho-dot { flex: none; width: .5rem; height: .5rem; border-radius: 50%; background: #f97316; animation: tacho-pulse 1.8s infinite; }
.tacho-meter { position: relative; flex: none; width: 3.25rem; height: .3rem; overflow: hidden; border-radius: 1rem; background: #2533421f; }
.tacho-meter > span { position: absolute; inset: 0; background: #f97316; transform-origin: left; transition: transform .2s linear; }
.tacho-hint.is-alert .tacho-meter > span { background: #dc2626; }
.tacho-badge { flex: none; padding: .1rem .4rem; border-radius: 1rem; background: #253342; color: #fff; font-size: .625rem; }
.tacho-controls { position: absolute; left: .875rem; right: 4.2rem; bottom: .875rem; display: flex; gap: .4rem; }
.tacho-btn { pointer-events: auto; display: inline-flex; align-items: center; justify-content: center; gap: .4rem; min-width: 2.75rem; min-height: 2.75rem; padding: .4rem .75rem; border-radius: .8rem; background: rgb(255 255 255 / .94); color: #253342; font: 700 .75rem/1.15 'Nunito', sans-serif; white-space: nowrap; box-shadow: 0 2px 10px #25334215; transition: background-color .2s, color .2s, opacity .2s; }
.tacho-btn:hover { background: #fff; }
.tacho-btn:active { transform: translateY(1px); }
.tacho-btn:focus-visible { outline: 3px solid #f97316; outline-offset: 3px; }
.tacho-btn svg { flex: none; width: 1.15rem; height: 1.15rem; fill: none; stroke: currentColor; stroke-width: 2; stroke-linecap: round; stroke-linejoin: round; }
.tacho-btn[aria-disabled='true'] { opacity: .6; }
.tacho-btn--primary { background: #253342; color: #fff; }
.tacho-btn--primary:hover { background: #1a2632; }
.tacho-btn--primary.is-out { background: #f97316; }
.tacho-btn--primary.is-out:hover { background: #ea670c; }
.tacho-btn--primary.is-out:focus-visible { outline-color: #253342; }
@keyframes tacho-pulse { 0% { box-shadow: 0 0 0 0 #f9731680; } 70%, 100% { box-shadow: 0 0 0 .45rem #f9731600; } }
@container tacho (max-width: 600px) {
  .tacho-btn:not(.tacho-btn--primary) { padding: 0; }
  .tacho-btn:not(.tacho-btn--primary) .tacho-label { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
}
@container tacho (max-width: 420px) {
  .tacho-label-long { display: none; }
  .tacho-hint { padding: .35rem .65rem .35rem .55rem; font-size: .6875rem; }
}
@media (prefers-reduced-motion: reduce) { .tacho-dot { animation: none; } }
</style>
