<template>
  <nav class="bg-[#FEFEF6] text-[#696BE2] flex justify-between items-center px-4" style="height: 10vh;">
    <div class="flex items-center">
      <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto" />
    </div>
    <div class="flex space-x-16 text-lg font-medium">
      <router-link to="/" class="hover:text-opacity-70" active-class="active-link">Accueil</router-link>
      <router-link to="/product" class="hover:text-opacity-70" active-class="active-link">Produit</router-link>
      <router-link to="/merch" class="hover:text-opacity-70" active-class="active-link">Merch</router-link>
    </div>
    <div class="flex items-center space-x-6 text-lg font-medium">
      <router-link to="/register" class="hover:text-opacity-70" active-class="active-link">S'inscrire</router-link>
      <router-link to="/login" class="hover:text-opacity-70" active-class="active-link">Connexion</router-link>
      <img src="/Tropicool search.svg" alt="Search Icon" class="w-6 h-6" />
      <img src="/Tropicool logo.png" alt="User Icon" class="w-6 h-6" />
      <img src="/Panier Tropicool.png" alt="Panier Icon" class="w-6 h-6" />
    </div>
  </nav>
</template>

<script setup lang="ts">
import { useAuthStore } from '../stores/authStore';

const auth = useAuthStore();

function logout() {
  auth.logout();
}
</script>

<style scoped>
nav {
  height: 10vh; 
}

.active-link {
  font-weight: bold;
}
</style>
