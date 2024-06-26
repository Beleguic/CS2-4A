<template>
  <div>
    <h1>Verification du Compte</h1>
    <p v-if="verified">Votre compte a été vérifié avec succès!</p>
    <p v-else>Échec de la vérification de votre compte. Veuillez réessayer ou contacter le support.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';

const verified = ref(false);

onMounted(async () => {
    const route = useRoute();
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
    }
});
</script>
