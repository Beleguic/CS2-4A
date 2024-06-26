<template>
  <footer class="bg-[#696BE2] text-white p-6 flex flex-col items-center justify-center w-full min-h-[15vh]">
    <div class="flex flex-col items-center">
      <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto mb-4" />
      <p class="text-center italic font-medium text-lg">
        © 2024 Tropicool. Tous droits réservés.<br />
        Contactez-nous : <a href="mailto:team.troupicool@outlook.fr" class="link">team.troupicool@outlook.fr</a><br />
        Suivez-nous sur les réseaux sociaux :
      </p>
      <div class="flex space-x-4 mt-2">
        <a href="https://www.instagram.com" target="_blank">
          <img src="/instagram-icon.svg" alt="Instagram Icon" class="w-6 h-6" />
        </a>
        <a href="https://www.twitter.com" target="_blank">
          <img src="/twitter-icon.svg" alt="Twitter Icon" class="w-6 h-6" />
        </a>
      </div>
      <p class="text-center italic font-medium text-lg mt-4">
        <router-link to="/privacy-policy" class="link" active-class="active-link">Politique de confidentialité</router-link> | Conditions d'utilisation<br />
        Dégustez nos boissons avec modération. Ne pas conduire en état d'ébriété.
      </p>
    </div>
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
footer {
  min-height: 15vh; 
}

a {
  color: #1D1F96;
}

.link {
  text-decoration: none;
  color: #1D1F96;
}

.link:hover {
  text-decoration: underline;
}

.active-link {
  text-decoration: none !important;
}
</style>
