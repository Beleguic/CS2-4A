<template>
    <div class="relative w-full bg-custom">
        <!-- Formulaire de reinistialisation de MDP -->
        <div class="flex flex-col items-center gap-4">
            <img src="/logo-troupicool.png" class="w-40">
            <div class="w-full max-w-2xl bg-[rgb(105,107,226)] p-8 rounded-3xl shadow-lg mb-16">
                <h2 class="text-2xl font-bold mb-1 text-center text-white">Mot de passe oublié</h2>
                <FormComponent
                    :fields="fields"
                    submitButtonText="Envoyer le lien de réinitialisation"
                    @submit.prevent="submit"
                />
            </div>
        </div>
    </div>
</template>
      
<script setup>
import { ref } from 'vue';
import FormComponent from '../components/FormComponent.vue';

const email = ref('');

const fields = [
    {  
    field: [
        [{ name: 'email', label: 'Adresse mail', type: 'email', required: true, color: 'white' }],
      ],
    },
];

const submit = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email: email.value }),
    });

    if (!response.ok) {
      throw new Error('Une erreur est survenue. Veuillez réessayer.');
    }

    alert('Un lien de réinitialisation a été envoyé à votre adresse e-mail.');
  } catch (error) {
    console.error('Erreur lors de l\'envoi du lien de réinitialisation:', error);
    alert(error.message);
  }
};
</script>


<style scoped>
/* Style your form here */
</style>
