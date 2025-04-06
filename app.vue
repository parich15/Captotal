<template>
  <div>
    <NuxtLoadingIndicator color="#f97316" />
    <Topbar />
    <Navbar />
    <NuxtPage :transition="{ name: 'page', mode: 'out-in' }" />
    <BannerCookies></BannerCookies>
    <Footer />
    <!-- <div id="teleportContent"></div> -->
  </div>
</template>

<script setup>
import Navbar from './components/layout/navbar.vue';
import Topbar from './components/layout/topbar.vue';
import Footer from './components/layout/footer.vue';
import BannerCookies from './components/layout/bannerCookies.vue';
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
