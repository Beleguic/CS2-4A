<template>
    <div class="relative w-full bg-custom">
        <!-- Formulaire de reinistialisation de MDP -->
        <div class="flex flex-col items-center gap-4">
            <img src="/logo-troupicool.png" class="w-40">
            <div class="w-full max-w-2xl bg-[rgb(105,107,226)] p-8 rounded-3xl shadow-lg mb-16">
                <h2 class="text-2xl font-bold mb-1 text-center text-white">Verification du Compte</h2>
                <p v-if="verified">Votre compte a été vérifié avec succès!</p>
                <p v-else>Échec de la vérification de votre compte. Veuillez réessayer ou contacter le support.</p>
            </div>
        </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const verified = ref(false);
  const route = useRoute();
  
  onMounted(async () => {
      const token = route.query.token;
  
      if (token) {
          try {
              const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/verify/${token}`, {
                  method: 'GET',
              });
              if (response.ok) {
                  verified.value = true;
              } else {
                  throw new Error('Failed to verify account');
              }
          } catch (error) {
              console.error('Verification error:', error);
              verified.value = false;
          }
      } else {
          verified.value = false;
      }
  });
  </script>
  