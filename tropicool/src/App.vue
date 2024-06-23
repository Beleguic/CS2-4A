<template>
  <div id="app">
    <div v-if="isDashboardRoute" class="h-screen flex">
      <DashboardSidebar v-if="isDashboardRoute" />
      <main id="main-dashboard" class="bg-white p-0 flex-1 flex flex-col ml-80 relative">
        <DashboardNavbar />
        <router-view></router-view>
      </main>
    </div>

    <Navbar v-if="!isDashboardRoute"/>
    <main v-if="!isDashboardRoute">
        <router-view></router-view>
      </main>
    <FooterVue v-if="!isDashboardRoute"/>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useRoute } from 'vue-router';

import Navbar from './components/NavbarComponent.vue';
import FooterComponent from './components/FooterComponent.vue';
import DashboardSidebar from './components/DashboardSidebar.vue';
import DashboardNavbar from './components/DashboardNavbar.vue';

const route = useRoute();

const isDashboardRoute = computed(() => route.path.startsWith('/dashboard'));
</script>

<style>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  height: 100%;
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

main:not(#main-dashboard) {
  justify-content: center;
  align-items: center;
}
</style>
