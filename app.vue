<template>
  <div>
    <NuxtLoadingIndicator color="#f97316" />
    <Topbar />
    <navbar></navbar>
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    <LayoutBannerCookies />
    <Footer />
    <div id="teleportContent"></div>
  </div>
</template>

<script setup>
import Navbar from './components/layout/navbar.vue';
import Topbar from './components/layout/topbar.vue';
import Footer from './components/layout/footer.vue';
</script>

<style>
.page-enter-active,
.page-leave-active {
  transition: all 0.5s;
}

.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
</style>
