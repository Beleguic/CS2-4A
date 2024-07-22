<template>
  <footer class="bg-[#696BE2] text-white p-6 flex flex-col items-center justify-center w-full h-full">
    <div class="flex flex-col items-center">
      <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto mb-4" />
      <p class="text-center italic font-medium text-lg">
        © 2024 Tropicool. Tous droits réservés.<br />
        Contactez-nous : <a href="mailto:team.troupicool@outlook.fr" class="link">team.troupicool@outlook.fr</a><br />
        Suivez-nous sur les réseaux sociaux :
      </p>
      
      <p class="text-center italic font-medium text-lg mt-4">
        <router-link to="/privacy-policy" class="link" active-class="active-link">Politique de confidentialité</router-link> |
        <router-link to="/conditions-generales-dutilisation" class="link" active-class="active-link">Conditions Générales d'Utilisation</router-link> |
        Informations légales sur la <router-link to="/venteAlcool" class="link" active-class="active-link">vente d'alcool</router-link>
        <br />
        Dégustez nos boissons avec modération. Ne pas conduire en état d'ébriété.
      </p>
    </div>
    <img src="/Bandeau-Boissons-Alcooliques.jpg" alt="Bandeau Boissons Alcooliques" class="footer-banner mt-4" />
  </footer>
</template>

<script setup lang="ts">
</script>

<style scoped>
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

.footer-banner {
  width: 50%;
  height: auto;
}
</style>

