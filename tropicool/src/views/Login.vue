<template>
  <div class="login-container">
    <h1>Connexion</h1>
    <FormComponent
      :fields="fields"
      submitButtonText="Se connecter"
      @submit="login"
    />
    <div>
      <RouterLink to="/forgot-password">Mot de passe oublié ?</RouterLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import FormComponent from '../components/FormComponent.vue';

const router = useRouter();
const auth = useAuthStore();

const fields = [
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Mot de passe', type: 'password', required: true },
];

const login = async (formData: { email: string, password: string }) => {
  try {
    await auth.login(formData.email, formData.password);
    router.push('/');
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
