<template>
  <div v-if="isDashboardRoute" class="h-screen flex">
    <DashboardSidebar v-if="isDashboardRoute" />
    <main id="main-dashboard" class="bg-white p-0 flex-1 flex flex-col ml-80 relative">
      <DashboardNavbar />
      <router-view />
    </main>
  </div>

  <Navbar v-if="!isDashboardRoute" />
  <main v-if="!isDashboardRoute">
    <router-view></router-view>
  </main>
  <FooterComponent v-if="!isDashboardRoute" />

  <ToastManager ref="toastManager" />
  <ScrollToTopButton />
</template>

<script lang="ts" setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute } from 'vue-router';
import useCartCheck from './composables/useCartCheck';

import Navbar from './components/NavbarComponent.vue';
import FooterComponent from './components/FooterComponent.vue';
import DashboardSidebar from './components/DashboardSidebar.vue';
import DashboardNavbar from './components/DashboardNavbar.vue';
import ScrollToTopButton from './components/ScrollToTopButton.vue';
import ToastManager from './components/ToastManager.vue';

const route = useRoute();
const toastManager = ref(null);

const isDashboardRoute = computed(() => route.path.startsWith('/dashboard'));

useCartCheck();

onMounted(() => {
  // Afficher le toast de bienvenue lorsque l'utilisateur arrive sur le site
  toastManager.value.addToast('Bienvenue sur Troupicool !', 'success');
});
</script>

<style>
main {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  padding: 0;
  margin: 0; 
}
</style>
