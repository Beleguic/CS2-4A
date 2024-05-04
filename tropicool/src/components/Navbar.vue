<template>
    <nav class="navbar">
      <img src="../assets/logo.webp" alt="Logo" class="navbar-logo">
      <div class="navbar-links">
        <router-link v-if="!auth.isLoggedIn" to="/login">Connexion</router-link>
        <router-link v-if="!auth.isLoggedIn" to="/register">Inscription</router-link>
        <button v-if="auth.isLoggedIn" @click="logout">Déconnexion</button>
      </div>
    </nav>
  </template>
  
  <script setup>
  import { useAuthStore } from '../stores/authStore';
  
  const auth = useAuthStore();
  
  function logout() {
    auth.logout();
  }
  </script>
  <style scoped>
    .navbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem;
      background-color: #333;
      color: #fff;
      width: 100%;
  }
    
  .navbar-logo {
      width: 50px;
  }
    
  .navbar-links a, .navbar-links button {
      color: #fff;
      text-decoration: none;
      margin-left: 1rem;
  }
  </style>