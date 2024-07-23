<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-md bg-main p-8 rounded-3xl shadow-lg mb-16 grid gap-8">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Inscription</h2>
        <FormComponent
          :fields="fields"
          submitButtonText="Envoyer"
          @submit="register"
        />
        <div class="flex items-center justify-between">
          <router-link :to="{ name : 'Login' } ">Se connecter</router-link>
          <router-link :to="{ name : 'ForgotPassword' }">Mot de passe oublié ?</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL;

const fields = [
    {  
    field: [
        [{ name: 'lastName', label: 'Nom', type: 'text', required: true, placeholder: 'lala', color: 'white' },{ name: 'firstName', label: 'Prénom', type: 'text', required: true, color: 'white' }],
        [{ name: 'username', label: 'Nom d\'utilisateur', type: 'text', required: true, color: 'white' }],
        [{ name: 'email', label: 'Adresse mail', type: 'email', required: true, color: 'white' }],
        [{ name: 'password', label: 'Mot de passe', type: 'password', required: true, color: 'white' }],
        [{ name: 'confirmPassword', label: 'Confirmez le mot de passe', type: 'password', required: true, color: 'white' }],
        [{ name: 'birthday', label: 'Date de naissance', type: 'date', required: true, color: 'white' }],
        [{ name: 'acceptTerms', label: 'Accepter les conditions générales d\'utilisation', type: 'checkbox', required: true, color: 'white', link: '/conditions-generales-dutilisation' }],
    ],
    },
];

const register = async (formData) => {
  if (formData.password !== formData.confirmPassword) {
    $toast.open({
      message: 'Les mots de passe ne correspondent pas !',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  if (!formData.acceptTerms) {
    $toast.open({
      message: 'Vous devez accepter les conditions générales d\'utilisation.',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  try {
    const requestBody = {
      lastName: formData.lastName,
      firstName: formData.firstName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.birthday,
    };

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (response.ok) {
      $toast.open({
        message: "Inscription réussie! Vérifiez votre email pour confirmer votre inscription",
        type: 'success',
        position: 'bottom-left',
      });
      router.push('/');
    } else {
      $toast.open({
        message: "Échec lors de l'inscription, veuillez recommencer",
        type: 'error',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    $toast.open({
      message: "Erreur, veuillez recommencer",
      type: 'error',
      position: 'bottom-left',
    });
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
