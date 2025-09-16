<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-2xl bg-[rgb(105,107,226)] p-8 rounded-3xl shadow-lg mb-16">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Mot de passe oublié</h2>
        <FormComponent
          :fields="fields"
          submitButtonText="Envoyer le lien de réinitialisation"
          @submit="handleSubmit"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FormComponent from '../components/FormComponent.vue';
import { useErrorHandler } from '../composables/useErrorHandler';

const { handleError, handleSuccess } = useErrorHandler();
const email = ref('');

const fields = [
  {
    field: [
      [{ name: 'email', label: 'Adresse mail', type: 'email', required: true, color: 'white' }],
    ],
  },
];

interface ForgotPasswordFormData {
  email: string;
}

const handleSubmit = async (formData: ForgotPasswordFormData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email }),
    });

    if (response.ok) {
      handleSuccess('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
    } else {
      const errorData = await response.json();
      handleError(errorData.message || 'Erreur lors de l\'envoi de l\'email');
    }
  } catch (error) {
    handleError(error, 'Erreur lors de l\'envoi de l\'email');
  }
};
</script>

<style scoped>
/* Style your form here */
</style>
