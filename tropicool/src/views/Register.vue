<template>
  <div class="relative w-full bg-custom">
    <!-- Formulaire d'inscription -->
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-md bg-[rgb(105,107,226)] p-8 rounded-3xl shadow-lg mb-16">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Inscription</h2>
        <FormComponent
          :fields="fields"
          submitButtonText="Envoyer"
          @submit="register"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL;

const fields = [
  { name: 'lastName', label: 'Nom', type: 'text', required: true },
  { name: 'firstName', label: 'Prénom', type: 'text', required: true },
  { name: 'username', label: 'Nom d\'utilisateur', type: 'text', required: true },
  { name: 'email', label: 'Adresse mail', type: 'email', required: true },
  { name: 'password', label: 'Mot de passe', type: 'password', required: true },
  { name: 'confirmPassword', label: 'Confirmez le mot de passe', type: 'password', required: true },
  { name: 'birthday', label: 'Date de naissance', type: 'date', required: true },
];

const register = async (formData) => {
  console.log('register function called with:', formData);

  if (formData.password !== formData.confirmPassword) {
    alert('Les mots de passe ne correspondent pas.');
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

    const responseText = await response.text(); // Lire la réponse en tant que texte

    let responseData;
    try {
      responseData = JSON.parse(responseText); // Essayer de parser la réponse JSON
    } catch (e) {
      console.error('Erreur de parsing JSON:', e, 'Réponse:', responseText);
      throw new Error('Réponse JSON invalide');
    }

    if (response.ok) {
      console.log('Inscription réussie:', responseData);
      router.push('/');
    } else {
      console.error('Échec de l\'inscription:', responseData);
    }
  } catch (error) {
    console.error('Erreur lors de la communication avec l\'API:', error);
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
  background: url('image-background.svg') repeat center center;
  background-size: cover;
}

h2 {
  color: #FFFFFF;
}
</style>
