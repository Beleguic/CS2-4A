<template>
  <div id="app">
    <Navbar />
    <main>
      <router-view></router-view>
    </main>
    <FooterVue />
  </div>
</template>

<script setup>
import Navbar from './components/Navbar.vue';
import FooterVue from './components/Footer.vue';
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

main {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center; /* Centrer le contenu verticalement */
  align-items: center; /* Centrer le contenu horizontalement */
}
</style>
