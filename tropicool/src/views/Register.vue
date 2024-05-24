<template>
  <div class="register-container flex justify-center items-center h-screen bg-gray-800">
    <div class="w-full max-w-xs">
      <FormComponent
        :fields="fields"
        submitButtonText="S'inscrire"
        @submit="register"
      />
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
  { name: 'email', label: 'Email', type: 'email', required: true },
  { name: 'password', label: 'Mot de passe', type: 'password', required: true },
];

const register = async (formData) => {
  console.log('register function called with:', formData);
  if (!validatePassword(formData.password)) {
    alert('Le mot de passe doit contenir au moins 12 caractères, incluant des majuscules, des minuscules, des chiffres et des symboles.');
    return;
  }

  try {
    const requestBody = {
      email: formData.email,
      password: formData.password
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
      console.log('Inscription réussie:', responseData);
      router.push('/');
    } else {
      console.error('Échec de l\'inscription:', responseData);
    }
  } catch (error) {
    console.error('Erreur lors de la communication avec l\'API:', error);
  }
};

function validatePassword(password) {
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\\-])[A-Za-z\d@$!%*?&_\\-]{12,}$/;
  return regex.test(password);
}
</script>

<style scoped>
</style>
