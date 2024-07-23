<template>
    <div class="not-found-container">
      <img src="/404ErrorPageDragon.png" alt="404 Error" class="not-found-image" />
      <p class="error-message">Oups! La page que vous recherchez n'existe pas.</p>
      <router-link to="/product" class="home-link">Retour aux produits</router-link>
    </div>
  </template>
  
  <script setup>
  </script>
  
  <style scoped>
  .not-found-container {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    height: 100vh;
    text-align: center;
    background-color: #f9f9f9;
  }
  
  .not-found-image {
    max-width: 100%;
    height: auto;
    margin-bottom: 2rem;
  }
  
  .error-message {
    font-size: 1.5rem;
    color: black; /* Changer la couleur du texte en noir */
    margin-bottom: 2rem;
  }
  
  .home-link {
    font-size: 1.2rem;
    color: #696BE2;
    text-decoration: none;
    background-color: #fff;
    padding: 0.5rem 1rem;
    border-radius: 5px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    margin-bottom: 2rem; /* Ajouter une marge en bas */
  }
  
  .home-link:hover {
    text-decoration: underline;
    background-color: #f0f0f0;
  }
  </style>
  