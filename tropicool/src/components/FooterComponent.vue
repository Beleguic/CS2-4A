<template>
  <footer class="bg-[#696BE2] text-white p-6 flex flex-col items-center justify-center w-full h-full">
    <div class="flex flex-col items-center">
      <img src="/Tropicool preview.png" alt="Tropicool Logo" class="w-20 h-auto mb-4" />
      <p class="text-center italic font-medium text-lg">
        © 2024 Tropicool. Tous droits réservés.<br />
        Contactez-nous : <a href="mailto:team.troupicool@outlook.fr" class="link">team.troupicool@outlook.fr</a><br />
        Suivez-nous sur les réseaux sociaux :
      </p>
      <div class="flex space-x-4 mt-2">
        <a href="https://www.instagram.com" target="_blank">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="50px" height="50px"><g fill="#1d1f96" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M16,3c-7.16752,0 -13,5.83248 -13,13v18c0,7.16752 5.83248,13 13,13h18c7.16752,0 13,-5.83248 13,-13v-18c0,-7.16752 -5.83248,-13 -13,-13zM16,5h18c6.08648,0 11,4.91352 11,11v18c0,6.08648 -4.91352,11 -11,11h-18c-6.08648,0 -11,-4.91352 -11,-11v-18c0,-6.08648 4.91352,-11 11,-11zM37,11c-1.10457,0 -2,0.89543 -2,2c0,1.10457 0.89543,2 2,2c1.10457,0 2,-0.89543 2,-2c0,-1.10457 -0.89543,-2 -2,-2zM25,14c-6.06329,0 -11,4.93671 -11,11c0,6.06329 4.93671,11 11,11c6.06329,0 11,-4.93671 11,-11c0,-6.06329 -4.93671,-11 -11,-11zM25,16c4.98241,0 9,4.01759 9,9c0,4.98241 -4.01759,9 -9,9c-4.98241,0 -9,-4.01759 -9,-9c0,-4.98241 4.01759,-9 9,-9z"></path></g></g></svg>
        </a>
        <a href="https://www.twitter.com" target="_blank">
          <svg class="w-6 h-6" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0,0,256,256" width="50px" height="50px"><g fill="#1d1f96" fill-rule="nonzero" stroke="none" stroke-width="1" stroke-linecap="butt" stroke-linejoin="miter" stroke-miterlimit="10" stroke-dasharray="" stroke-dashoffset="0" font-family="none" font-weight="none" font-size="none" text-anchor="none" style="mix-blend-mode: normal"><g transform="scale(5.12,5.12)"><path d="M11,4c-3.85433,0 -7,3.14567 -7,7v28c0,3.85433 3.14567,7 7,7h28c3.85433,0 7,-3.14567 7,-7v-28c0,-3.85433 -3.14567,-7 -7,-7zM11,6h28c2.77367,0 5,2.22633 5,5v28c0,2.77367 -2.22633,5 -5,5h-28c-2.77367,0 -5,-2.22633 -5,-5v-28c0,-2.77367 2.22633,-5 5,-5zM13.08594,13l9.22266,13.10352l-9.30859,10.89648h2.5l7.9375,-9.29297l6.53906,9.29297h7.9375l-10.125,-14.38672l8.21094,-9.61328h-2.5l-6.83984,8.00977l-5.63672,-8.00977zM16.91406,15h3.06445l14.10742,20h-3.06445z"></path></g></g></svg>
        </a>
      </div>
      <p class="text-center italic font-medium text-lg mt-4">
        <router-link to="/privacy-policy" class="link" active-class="active-link">Politique de confidentialité</router-link> |
        <router-link to="/conditions-generales-dutilisation" class="link" active-class="active-link">Conditions Générales d'Utilisation</router-link>|
        Informations légales sur la <router-link to="/venteAlcool" class="link" active-class="active-link">vente d'alcool</router-link>
        <br />
        Dégustez nos boissons avec modération. Ne pas conduire en état d'ébriété.
      </p>
    </div>
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
</style>
