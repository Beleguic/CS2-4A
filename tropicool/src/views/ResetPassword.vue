<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-2xl bg-[rgb(105,107,226)] p-8 rounded-3xl shadow-lg mb-16">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Réinitialiser le mot de passe</h2>
        <FormComponent
          :fields="fields"
          :modelValue="formData"
          submitButtonText="Réinitialiser"
          @submit="submit"
          @update:modelValue="updateFormData"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useRoute } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const route = useRoute();

const formData = ref({
  password: '',
  confirmPassword: ''
});

const fields = [
  {
    field: [
      [{ name: 'password', label: 'Mot de passe', type: 'password', required: true, color: 'white' }],
      [{ name: 'confirmPassword', label: 'Confirmez le mot de passe', type: 'password', required: true, color: 'white' }],
    ],
  },
];

const updateFormData = (newData) => {
  formData.value = newData;
};

const submit = async () => {
  if (formData.value.password !== formData.value.confirmPassword) {
    $toast.open({
      message: 'Les mots de passe ne correspondent pas.',
      type: 'error',
      position: 'bottom-left',
    }); 
    return;
  }

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/reset-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: route.query.token, password: formData.value.password }),
    });

    const data = await response.json();

    if (!response.ok) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }

    $toast.open({
      message: 'Votre mot de passe a été réinitialisé. Vous pouvez maintenant vous connecter.',
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
