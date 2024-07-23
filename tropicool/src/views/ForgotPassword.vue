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

<script setup>
import { ref } from 'vue';
import FormComponent from '../components/FormComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const email = ref('');

const fields = [
  {
    field: [
      [{ name: 'email', label: 'Adresse mail', type: 'email', required: true, color: 'white' }],
    ],
  },
];

const handleSubmit = async (formData) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: formData.email }),
    });

    if (!response.ok) {
      $toast.open({
        message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
        type: 'success',
        position: 'bottom-left',
      }); 
    }

    $toast.open({
      message: 'Un lien de réinitialisation a été envoyé à votre adresse e-mail.',
      type: 'success',
      position: 'bottom-left',
    }); 
  } catch (error) {
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    }); 
  }
};
</script>

<style scoped>
/* Style your form here */
</style>
