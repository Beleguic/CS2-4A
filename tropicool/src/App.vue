<template>
  <div id="app">
    <Navbar />
    <main>
      <router-view></router-view>
    </main>
    <FooterComponent />
  </div>
</template>

<script setup>
import Navbar from './components/NavbarComponent.vue';
import FooterComponent from './components/FooterComponent.vue';
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
  justify-content: center;
  align-items: center;
  padding: 0;
  margin: 0; 
}
</style>
