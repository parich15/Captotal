<template>
  <div>
    <Topbar></Topbar>
    <navbar></navbar>
    <NuxtPage></NuxtPage>
    <Footer></Footer>
    <div id="teleportContent"></div>
  </div>
</template>

<script setup>
import navbar from './components/layout/navbar.vue';
import Topbar from './components/layout/topbar.vue';
import Footer from './components/layout/footer.vue';
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.4s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>