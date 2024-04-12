<template>
  <div>
    <h1>Bienvenue sur Troupicool, {{ userName }} !</h1>
    <p>Nous sommes ravis de vous compter parmi nous.</p>
    <p>Veuillez cliquer sur le lien ci-dessous pour vérifier votre compte :</p>
    <a :href="verificationLink" target="_blank">Vérifier mon compte</a>
    <p>Si vous n'avez pas créé de compte sur notre site, veuillez ignorer cet e-mail.</p>
  </div>
</template>

<script setup>
import { ref, computed, defineProps } from 'vue';

defineProps(['userName', 'verificationToken']);

const apiUrl = import.meta.env.VITE_API_URL;
const userId = ref('12345'); // Cela doit être remplacé par une valeur dynamique en fonction de l'utilisateur

// Calculez le lien de vérification en fonction du token de vérification
const verificationLink = computed(() => {
  return `${apiUrl}/verify-account?token=${verificationToken.value}&id=${userId.value}`;
});
</script>
