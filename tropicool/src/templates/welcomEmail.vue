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
// Importez les outils nécessaires depuis Vue si nécessaire
import { ref, computed , defineProps} from 'vue';

const userName = ref('Matiss HAILLOUY');
const userId = ref('12345');
const verificationToken = ref('abcd1234');

defineProps({
  userName: String,
  verificationLink: String
});
// Calculez le lien de vérification
const verificationLink = computed(() => {
  return `${import.meta.env.VITE_API_URL}/verify-account?token=${verificationToken.value}&id=${userId.value}`;
});
</script>
