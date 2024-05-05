<template>
  <div class="register-container flex justify-center items-center h-screen bg-gray-800">
    <div class="w-full max-w-xs">
      <form @submit.prevent="register" class="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div class="mb-4">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="email">
            Email:
          </label>
          <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" type="email" id="email" v-model="email" required>
        </div>
        <div class="mb-6">
          <label class="block text-gray-700 text-sm font-bold mb-2" for="password">
            Mot de passe:
          </label>
          <input class="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 mb-3 leading-tight focus:outline-none focus:shadow-outline" type="password" id="password" v-model="password" required>
          <p v-if="passwordError" class="text-red-500 text-xs italic">{{ passwordError }}</p>
        </div>
        <div class="flex items-center justify-between">
          <button class="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline" type="submit">
            S'inscrire
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const apiUrl = import.meta.env.VITE_API_URL;
const email = ref('');
const password = ref('');
const passwordError = ref('');

const register = async () => {
  if (!validatePassword(password.value)) {
    passwordError.value = 'Le mot de passe doit contenir au moins 12 caractères, incluant des majuscules, des minuscules, des chiffres et des symboles.';
    return;
  }

  try {
    const requestBody = {
      email: email.value,
      password: password.value
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
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{12,}$/;
  return regex.test(password);
}
</script>

<style scoped>
</style>
