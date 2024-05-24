<template>
    <div class="forgot-password">
        <h1>Mot de passe oublié</h1>
        <form @submit.prevent="submit">
        <div>
            <label for="email">Email:</label>
            <input type="email" id="email" v-model="email" required>
        </div>
        <button type="submit">Envoyer le lien de réinitialisation</button>
        </form>
    </div>
</template>
      
<script setup>
import { ref } from 'vue';

const email = ref('');

const submit = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    });

    if (!response.ok) {
      throw new Error('Une erreur est survenue. Veuillez réessayer.');
    }

    alert('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du lien de réinitialisation:', error);
    alert(error.message);
  }
};
</script>


<style scoped>
/* Style your form here */
</style>
