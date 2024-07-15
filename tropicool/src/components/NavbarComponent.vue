<template>
    <nav class="bg-[#FEFEF6] text-[#696BE2] flex justify-between items-center px-4">
      <div class="flex items-center w-2/6">
          <router-link to="/">
          <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto" />
          </router-link>
      </div>
      <div class="flex space-x-16 text-lg font-medium w-2/6 justify-center">
          <router-link to="/" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Accueil</router-link>
          <router-link to="/product" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Produit</router-link>
          <router-link to="/merch" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Merch</router-link>
          <router-link v-if="isAdmin" to="/dashboard" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Dashboard</router-link>
      </div>
      <div class="flex items-center space-x-6 text-lg font-medium w-2/6 justify-end">
          <router-link v-if="!auth.isLoggedIn" to="/register" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">S'inscrire</router-link>
          <router-link v-if="!auth.isLoggedIn" to="/login" class="hover:text-white hover:bg-main px-5 py-3 rounded-full" active-class="text-white bg-main">Connexion</router-link>
          <button v-if="auth.isLoggedIn" @click="logout" class="hover:text-white hover:bg-main px-5 py-3 rounded-full">Déconnexion</button>
          <img src="/Tropicool search.svg" alt="Search Icon" class="w-6 h-6" />
          <img src="/Tropicool logo.png" alt="User Icon" class="w-6 h-6" />
          <img src="/Panier Tropicool.png" alt="Panier Icon" class="w-6 h-6" />
      </div>
    </nav>
  </template>
  
  <script setup lang="ts">
  import { computed } from 'vue';
  import { useAuthStore } from '../stores/authStore';
  
  const auth = useAuthStore();
  
  const isAdmin = computed(() => auth.userRole === 'admin');
  
  function logout() {
      auth.logout();
  }
  </script>
  
  <style scoped>
      .active-link {
          font-weight: bold;
      }
  </style>
  