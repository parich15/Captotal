<template>
    <carousel 
     :items-to-show="1" :wrap-around="true" :transition="500" :autoplay="5000">
        <slide v-for="datos in datosCarousel" :key="datos">
            <InicioSlide 
            :Titulo="datos.Titulo" 
            :Texto="datos.Texto"
            :Imagen="datos.Imagen"
            :Enlace="datos.Enlace"
            :Tipo="datos.Tipo"></InicioSlide>
        </slide>

    <template #addons>
      <!-- <navigation /> -->
      <Pagination/>
    </template>
  </carousel>
</template>

<script setup>
import { Carousel, Slide, Pagination, Navigation } from 'vue3-carousel'
import { usePageData } from '~~/composables/usePageData';

const {datosCarousel, getCarouselData } = usePageData();

await getCarouselData(1)

</script>

<style>
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