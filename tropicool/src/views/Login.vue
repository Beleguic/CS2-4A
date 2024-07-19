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
          <router-link :to="{ name : 'ResetPassword' }">Mot de passe oublié ?</router-link>
          <router-link :to="{ name : 'Register' } ">S'inscire</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// import { ref } from 'vue';
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