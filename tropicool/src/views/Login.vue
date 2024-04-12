<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <form @submit.prevent="login">
      <div>
        <label for="email">Email:</label>
        <input type="email" id="email" v-model="email" required>
      </div>
      <div>
        <label for="password">Mot de passe:</label>
        <input type="password" id="password" v-model="password" required>
      </div>
      <button type="submit">Se connecter</button>
    </form>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import router from '../router'; // Assurez-vous que le chemin d'importation est correct

const apiUrl = 'http://localhost:3000'; // Remplacez par l'URL de votre API si différente
const email = ref('');
const password = ref('');

const login = async () => {
  try {
    const response = await fetch(`${apiUrl}/users/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ email: email.value, password: password.value })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue lors de la connexion.');
    }

    // Stockez le token dans le stockage local ou une autre méthode de stockage de votre choix
    localStorage.setItem('token', data.token);
    localStorage.setItem('userId', data.userId);

    // Redirigez l'utilisateur ou effectuez d'autres actions de connexion
    router.push('/'); // Redirigez vers la page d'accueil ou le tableau de bord
  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    alert(error.message);
  }
};
</script>

<style scoped>
/* Vos styles ici */
</style>
