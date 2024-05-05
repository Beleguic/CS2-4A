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
    <div>
      <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuthStore } from '../stores/authStore';

const email = ref('');
const password = ref('');
const auth = useAuthStore();

const login = async () => {
  try {
    await auth.login(email.value, password.value);
  } catch (error: unknown) {
    console.error('Erreur lors de la connexion:', (error as Error).message);
    if ((error as Error).message.includes("expiré")) {
      alert("Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser.");
    } else {
      alert((error as Error).message);
    }
  }
};

</script>

<style scoped>
/* Vos styles ici */
</style>
