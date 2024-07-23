<template>
    <div class="container mx-auto p-6 bg-gray-50 rounded shadow-md">
      <h1 class="text-2xl font-bold text-gray-800 mb-4">Confirmation</h1>
      <h2 class="text-xl text-gray-700 mb-2">Votre commande a bien été prise en compte</h2>
      <h3 class="text-lg text-gray-600 mb-6">Merci pour votre achat</h3>
      <div class="space-y-2">
        <p><span class="font-semibold">Le </span> {{ formattedCreatedAt }}</p>
        <p><span class="font-semibold">Total:</span> {{ total }}</p>
        <p><span class="font-semibold">TVA:</span> {{ tva }}</p>
        <p><span class="font-semibold">Payé ? </span> {{ isPayedDisplay }}</p>
        <p><span class="font-semibold">Numéro de livraison:</span> {{ livraison }}</p>
      </div>
  
      <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Produits :</h3>
      <ul class="space-y-4">
        <li v-for="product in products" :key="product.product_id" class="bg-white p-4 rounded shadow">
          <img :src="product.image" :alt="product.name" class="w-16 h-16 object-cover rounded mb-4" />
          <p><span class="font-semibold">Nom:</span> {{ product.name }}</p>
          <p><span class="font-semibold">Quantité:</span> {{ product.quantity }}</p>
          <p><span class="font-semibold">Prix:</span> {{ product.price }}</p>
          <p><span class="font-semibold">Référence:</span> {{ product.reference }}</p>
          <p><span class="font-semibold">TVA:</span> {{ product.tva }}</p>
          <p><span class="font-semibold">Adulte:</span> {{ product.is_adult ? 'Oui' : 'Non' }}</p>
        </li>
      </ul>
  
      <h3 class="text-xl font-semibold text-gray-800 mt-8 mb-4">Adresse de Facturation :</h3>
      <div class="space-y-2">
        <p><span class="font-semibold">Nom:</span> {{ adresseFacturation.nom }}</p>
        <p><span class="font-semibold">Prénom:</span> {{ adresseFacturation.prenom }}</p>
        <p><span class="font-semibold">Société:</span> {{ adresseFacturation.societe }}</p>
        <p><span class="font-semibold">Adresse:</span> {{ adresseFacturation.adresse }}</p>
        <p><span class="font-semibold">Adresse 2:</span> {{ adresseFacturation.adresse2 }}</p>
        <p><span class="font-semibold">Ville:</span> {{ adresseFacturation.ville }}</p>
        <p><span class="font-semibold">Code Postal:</span> {{ adresseFacturation.code_postale }}</p>
        <p><span class="font-semibold">Téléphone:</span> {{ adresseFacturation.telephone }}</p>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import { useRoute } from 'vue-router';
  
  const route = useRoute();
  
  const orderId = ref<string | null>(null);
  const userId = ref<string | null>(null);
  const products = ref<Array<any>>([]);
  const createdAt = ref<string | null>(null);
  const total = ref<number | null>(null);
  const tva = ref<number | null>(null);
  const isPayed = ref<boolean | null>(null);
  const livraison = ref<string | null>(null);
  const adresseFacturation = ref<any>({});
  
  // Propriété calculée pour afficher "Oui" ou "Non" pour isPayed
  const isPayedDisplay = computed(() => (isPayed.value ? 'Oui' : 'Non'));
  
  // Propriété calculée pour formater la date createdAt en JJ/MM/ANNEE
  const formattedCreatedAt = computed(() => {
    if (!createdAt.value) return 'N/A';
    const date = new Date(createdAt.value);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Les mois sont indexés de 0 à 11
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  });
  
  const fetchOrder = async (id_order: string) => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/order/${id_order}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
  
      const data = await response.json();
      // Assign data to refs
      orderId.value = data.id || 'N/A';
      userId.value = data.user_id || 'N/A';
      products.value = data.products || [];
      createdAt.value = data.created_at || 'N/A';
      total.value = data.total || 0;
      tva.value = data.tva || 0;
      isPayed.value = data.isPayed || false;
      livraison.value = data.livraison || 'N/A';
      adresseFacturation.value = data.adresseFacturation || {};
    } catch (error) {
      console.error('Fetch error: ', error);
      orderId.value = 'N/A';
      userId.value = 'N/A';
      products.value = [];
      createdAt.value = 'N/A';
      total.value = 0;
      tva.value = 0;
      isPayed.value = false;
      livraison.value = 'N/A';
      adresseFacturation.value = {};
    }
  };
  
  onMounted(() => {
    const id_order = route.query.id_order as string || '';
    if (id_order) {
      fetchOrder(id_order);
    }
  });
  </script>
  
  <style scoped>
  /* Ajoutez ici vos styles */
  </style>
  