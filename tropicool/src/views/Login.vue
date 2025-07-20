<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4 min-h-screen">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-md bg-main p-8 rounded-3xl shadow-lg mb-16 grid gap-8">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Connexion</h2>
        <FormComponent
          :fields="fields"
          submitButtonText="Se connecter"
          @submit="login"
        />
        <div class="flex items-center justify-between">
          <router-link :to="{ name : 'ForgotPassword' }">Mot de passe oublié ?</router-link>
          <router-link :to="{ name : 'Register' } ">S'inscrire</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import FormComponent from '../components/FormComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const router = useRouter();
const auth = useAuthStore();

const fields = [
  {
    field: [
        [{ name: 'email', label: 'Email', type: 'email', required: true, color: 'white' }],
        [{ name: 'password', label: 'Mot de passe', type: 'password', required: true, color: 'white' }],
    ],
  },
  
];

const login = async (formData: { email: string, password: string }) => {
  try {
    await auth.login(formData.email, formData.password);
    router.push('/');
  } catch (error: unknown) {
    const errorMessage = (error as Error).message;
    
    // Messages d'erreur explicites selon le type d'erreur
    if (errorMessage.includes("expiré")) {
      $toast.open({
        message: 'Votre mot de passe est expiré. Veuillez vérifier votre e-mail pour le réinitialiser.',
        type: 'error',
        position: 'bottom-left',
      });
    } else if (errorMessage.includes("verifié")) {
      $toast.open({
        message: 'Votre compte n\'est pas encore vérifié. Veuillez vérifier votre e-mail et cliquer sur le lien de confirmation.',
        type: 'error',
        position: 'bottom-left',
      });
    } else if (errorMessage.includes("verrouillé") || errorMessage.includes("bloqué")) {
      $toast.open({
        message: 'Votre compte est temporairement verrouillé suite à trop de tentatives de connexion. Veuillez réessayer plus tard.',
        type: 'error',
        position: 'bottom-left',
      });
    } else if (errorMessage.includes("invalide") || errorMessage.includes("incorrect")) {
      $toast.open({
        message: 'Email ou mot de passe incorrect. Veuillez vérifier vos informations.',
        type: 'error',
        position: 'bottom-left',
      });
    } else if (errorMessage.includes("réseau") || errorMessage.includes("connexion")) {
      $toast.open({
        message: 'Erreur de connexion au serveur. Veuillez vérifier votre connexion internet et réessayer.',
        type: 'error',
        position: 'bottom-left',
      });
    } else {
      $toast.open({
        message: 'Une erreur inattendue s\'est produite. Veuillez réessayer.',
        type: 'error',
        position: 'bottom-left',
      });
    }
  }
};
</script>

<style scoped>
body {
  background-color: #FFFCE6;
  margin: 0;
  overflow: hidden;
}

.bg-custom {
  background: url('image-background.jpg') repeat center center;
  background-size: cover;
}

h2 {
  color: #FFFFFF;
}
</style>