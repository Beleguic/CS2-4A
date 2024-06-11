<template>
  <div id="app">
    <div v-if="isDashboardRoute" class="h-screen flex">
      <DashboardSidebar v-if="isDashboardRoute" />
      <main class="bg-white p-0 flex-1 flex flex-col ml-80 relative">
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

import Navbar from './components/Navbar.vue';
import FooterVue from './components/Footer.vue';
import DashboardSidebar from './components/dashboard/Sidebar.vue';
import DashboardNavbar from './components/dashboard/Navbar.vue';

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
}
</style>
