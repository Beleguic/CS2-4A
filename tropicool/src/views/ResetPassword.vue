<template>
    <div class="reset-password">
        <h1>Réinitialiser le mot de passe</h1>
        <form @submit.prevent="submit">
        <div>
            <label for="password">Nouveau mot de passe:</label>
            <input type="password" id="password" v-model="password" required>
        </div>
        <button type="submit">Réinitialiser</button>
        </form>
    </div>
</template>
      
<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';

const password = ref('');
const route = useRoute();

const submit = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: route.query.token, password: password.value }),
    });

    if (!response.ok) {
      throw new Error('Une erreur est survenue. Veuillez réessayer.');
    }

    alert('Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.');
  } catch (error) {
    console.error('Erreur lors de la réinitialisation du mot de passe:', error);
    alert(error.message);
  }
};
</script>

<style scoped>
/* Style your form here */
</style>
      