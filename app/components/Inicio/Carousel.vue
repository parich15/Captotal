<template>
  <div @touchstart.passive="iniciarGesto">
    <carousel
     :items-to-show="1" :transition="500" :autoplay="10000" :mouse-drag="true">
        <slide v-for="(datos,index) in datosCarousel" :key="index">
            <InicioSlide
            :Titulo="datos.Titulo"
            :Texto="datos.Texto"
            :Imagen="datos.Imagen"
            :Enlace="datos.Enlace"
            :Tipo="datos.Tipo"
            :esPrimera="index == 0 ? true : false">
          </InicioSlide>
        </slide>

    <template #addons>
      <Pagination/>
    </template>
  </carousel>
  </div>
</template>

<script setup>
import { Carousel, Slide, Pagination } from 'vue3-carousel'
import { usePageData } from '~/composables/usePageData';

const {datosCarousel, getCarouselData } = usePageData();

await getCarouselData(1)

// vue3-carousel 0.2 mueve el slide con cada touchmove, que escucha en document (captura).
// Si el gesto es vertical se corta antes, en window, y el navegador hace scroll sin arrastrar el slide.
const gesto = { x: 0, y: 0, vertical: null }

function iniciarGesto(event) {
    gesto.x = event.touches[0].clientX
    gesto.y = event.touches[0].clientY
    gesto.vertical = null
    window.addEventListener('touchmove', filtrarGesto, { capture: true, passive: true })
    window.addEventListener('touchend', terminarGesto, { capture: true, passive: true })
    window.addEventListener('touchcancel', terminarGesto, { capture: true, passive: true })
}

function filtrarGesto(event) {
    if (gesto.vertical === null) {
        const dx = Math.abs(event.touches[0].clientX - gesto.x)
        const dy = Math.abs(event.touches[0].clientY - gesto.y)
        // Con menos recorrido aún no se sabe hacia dónde va el dedo
        if (dx < 8 && dy < 8) return event.stopPropagation()
        gesto.vertical = dy > dx
    }
    if (gesto.vertical) event.stopPropagation()
}

function terminarGesto() {
    window.removeEventListener('touchmove', filtrarGesto, true)
    window.removeEventListener('touchend', terminarGesto, true)
    window.removeEventListener('touchcancel', terminarGesto, true)
}

</script>

<style>
/* La librería pone touch-action: none y en móvil, con el hero ocupando la pantalla, no se podía bajar */
.carousel .carousel__track {
    touch-action: pan-y;
    touch-action: pan-y pinch-zoom;
}
.carousel__pagination {
    display: flex;
    justify-content: center;
    list-style: none;
    line-height: 0;
    margin: -30px 0 0;
    z-index: 10;
    position: relative;
}
.carousel__pagination-button--active::after{
    background-color: #f97316;
}
</style>