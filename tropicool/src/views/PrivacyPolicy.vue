<template>
  <div class="privacy-policy-container bg-gray-50 p-10 font-sans text-gray-800 max-w-4xl mx-auto">
    <h1 class="privacy-title text-4xl font-bold text-center text-blue-800 mb-8">Politique de Confidentialité</h1>
    <p class="privacy-intro text-lg text-center mb-8">
      Chez Troupicool, nous nous engageons à protéger et à respecter votre vie privée. Cette politique de confidentialité explique comment nous recueillons, utilisons et protégeons vos informations personnelles lorsque vous utilisez notre site web et achetez nos produits.
    </p>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">1. Informations que nous recueillons</h2>
      <p>Nous pouvons recueillir et traiter les informations suivantes vous concernant :</p>
      <ul class="list-disc pl-5">
        <li>Informations que vous nous fournissez directement : lors de votre inscription, de l'achat de nos produits, ou lorsque vous nous contactez.</li>
        <li>Informations collectées automatiquement : comme les données de navigation, l'adresse IP, le type de navigateur, etc.</li>
      </ul>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">2. Utilisation de vos informations</h2>
      <p>Nous utilisons les informations que nous recueillons pour :</p>
      <ul class="list-disc pl-5">
        <li>Fournir et améliorer nos produits et services.</li>
        <li>Gérer votre compte et vos commandes.</li>
        <li>Vous envoyer des informations sur nos produits, offres spéciales et événements.</li>
        <li>Respecter nos obligations légales et réglementaires.</li>
      </ul>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">3. Partage de vos informations</h2>
      <p>Nous ne partageons vos informations personnelles qu'avec :</p>
      <ul class="list-disc pl-5">
        <li>Nos prestataires de services tiers qui nous aident à exploiter notre site web et à fournir nos services.</li>
        <li>Les autorités légales si nécessaire pour se conformer à une obligation légale.</li>
      </ul>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">4. Sécurité de vos informations</h2>
      <p>Nous prenons la sécurité de vos informations très au sérieux et utilisons diverses mesures pour les protéger, y compris des technologies de chiffrement et des systèmes de sécurité avancés.</p>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">5. Vos droits</h2>
      <p>Conformément au RGPD, vous disposez de droits concernant vos informations personnelles :</p>
      <ul class="list-disc pl-5">
        <li>Droit d'accès : vous pouvez demander à voir les informations que nous détenons sur vous.</li>
        <li>Droit de rectification : vous pouvez demander à corriger les informations inexactes ou incomplètes.</li>
        <li>Droit à l'effacement : vous pouvez demander la suppression de vos informations personnelles.effective apres 90 jours</li>
        <li>Droit d'opposition : vous pouvez vous opposer à l'utilisation de vos informations personnelles à certaines fins.</li>
        <li>Droit à la portabilité des données : vous pouvez demander à recevoir vos informations personnelles dans un format structuré, couramment utilisé et lisible par machine.</li>
      </ul>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">6. Spécificités liées à la vente d'alcool</h2>
      <p>Nous mettons en place des mesures pour vérifier que les acheteurs de produits alcoolisés ont l'âge légal requis en France (18 ans). Nous encourageons la consommation responsable de nos produits alcoolisés et fournissons des informations à ce sujet.</p>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">7. Spécificités liées à la vente de textiles et verrerie</h2>
      <p>Si vous commandez des articles personnalisés (comme des tee-shirts), nous pouvons collecter des informations supplémentaires nécessaires à cette personnalisation. Nous assurons que nos produits répondent aux normes de sécurité en vigueur en France, y compris pour les verreries utilisées pour la consommation de boissons.</p>
    </section>

    <section class="privacy-section mb-8">
      <h2 class="privacy-section-title text-2xl font-semibold text-blue-800 mb-4">8. Contact</h2>
      <p>Pour toute question ou demande concernant cette politique de confidentialité, vous pouvez nous contacter à l'adresse suivante : <a href="mailto:team.troupicool@outlook.fr" class="contact-email text-blue-800 underline">team.troupicool@outlook.fr</a>.</p>
      <p>Dernière mise à jour : Mercredi 15 juillet 2024.</p>
    </section>
  </div>
</template>

<script setup>
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');

body {
  @apply bg-gray-50 m-0 p-0 font-sans;
}

.privacy-policy-container {
  @apply bg-gray-50 p-10 text-gray-800 max-w-4xl mx-auto;
}

.privacy-title {
  @apply text-4xl font-bold text-center text-blue-800 mb-8;
}

.privacy-intro {
  @apply text-lg text-center mb-8;
}

.privacy-section {
  @apply mb-8;
}

.privacy-section-title {
  @apply text-2xl font-semibold text-blue-800 mb-4;
}

ul {
  @apply list-disc pl-5;
}

.contact-email {
  @apply text-blue-800 underline;
}
</style>
