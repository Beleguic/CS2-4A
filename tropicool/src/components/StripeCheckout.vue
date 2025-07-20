<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4 min-h-screen">
      <div class="w-full max-w-5xl bg-main p-8 rounded-3xl shadow-lg mb-16">
        <h2 class="text-2xl font-bold mb-6 text-center text-white">Finaliser votre commande</h2>
        
        <!-- Résumé de la commande -->
        <div class="bg-white rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Résumé de votre commande</h3>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Sous-total:</span>
              <span class="font-medium">{{ formatPrice(subtotal) }} €</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">TVA:</span>
              <span class="font-medium">{{ formatPrice(tva) }} €</span>
            </div>
            <div class="flex justify-between border-t pt-2">
              <span class="text-lg font-semibold text-gray-800">Total:</span>
              <span class="text-lg font-bold text-main">{{ formatPrice(total) }} €</span>
            </div>
          </div>
        </div>

        <!-- Informations de livraison -->
        <div class="bg-white rounded-lg p-6 mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Adresse de livraison</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Nom</label>
              <input 
                v-model="deliveryAddress.nom" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Prénom</label>
              <input 
                v-model="deliveryAddress.prenom" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <input 
                v-model="deliveryAddress.adresse" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Ville</label>
              <input 
                v-model="deliveryAddress.ville" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Code postal</label>
              <input 
                v-model="deliveryAddress.code_postale" 
                type="text" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              <input 
                v-model="deliveryAddress.telephone" 
                type="tel" 
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-main"
                required
              />
            </div>
          </div>
        </div>

        <!-- Bouton de paiement -->
        <div class="text-center">
          <button 
            @click="handleCheckout" 
            :disabled="loading || !isFormValid"
            class="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white font-bold py-3 px-8 rounded-lg text-lg transition-colors duration-200"
          >
            <span v-if="loading" class="flex items-center justify-center">
              <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Traitement en cours...
            </span>
            <span v-else>
              Payer {{ formatPrice(total) }} € avec Stripe
            </span>
          </button>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const authStore = useAuthStore();
const router = useRouter();
const route = useRoute();

// Références réactives
const loading = ref(false);
const errorMessage = ref('');
const orderId = ref('');

// Données de la commande
const subtotal = ref(parseFloat(route.query.total as string) || 0);
const tva = ref(parseFloat(route.query.tva as string) || 0);
const total = ref(subtotal.value + tva.value);

// Adresse de livraison
const deliveryAddress = ref({
  nom: '',
  prenom: '',
  adresse: '',
  ville: '',
  code_postale: '',
  telephone: ''
});

// Validation du formulaire
const isFormValid = computed(() => {
  return deliveryAddress.value.nom && 
         deliveryAddress.value.prenom && 
         deliveryAddress.value.adresse && 
         deliveryAddress.value.ville && 
         deliveryAddress.value.code_postale && 
         deliveryAddress.value.telephone;
});

// Formatage des prix
const formatPrice = (price: number) => {
  return price.toFixed(2);
};

// Gérer le checkout Stripe
const handleCheckout = async () => {
  if (!isFormValid.value) {
    errorMessage.value = 'Veuillez remplir tous les champs obligatoires';
    return;
  }

  loading.value = true;
  errorMessage.value = '';

  try {
    // 1. Créer la commande en base
    const orderData = {
      user_id: route.query.user_id,
      products: [], // Sera récupéré depuis le panier
      total: total.value,
      tva: tva.value,
      isPayed: false,
      livraison: '', // Sera généré par l'API La Poste
      adresseFacturation: deliveryAddress.value,
      payment_status: 'pending'
    };

    const orderResponse = await axios.post(`${import.meta.env.VITE_API_URL}/order/new`, orderData);
    orderId.value = orderResponse.data.id;

    // 2. Créer la session Stripe Checkout
    const checkoutData = {
      amount: Math.round(total.value * 100), // Stripe utilise les centimes
      order_id: orderId.value,
      customer_email: authStore.userEmail || 'customer@example.com',
      success_url: `${window.location.origin}/confirmation?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${window.location.origin}/cart`
    };

    const checkoutResponse = await axios.post(
      `${import.meta.env.VITE_API_URL}/stripe/create-checkout-session`, 
      checkoutData
    );

    // 3. Rediriger vers Stripe Checkout
    window.location.href = checkoutResponse.data.url;

  } catch (error) {
    console.error('Checkout error:', error);
    errorMessage.value = 'Une erreur est survenue lors de la création de la session de paiement. Veuillez réessayer.';
  } finally {
    loading.value = false;
  }
};

// Initialisation
onMounted(() => {
  // Pré-remplir l'adresse si disponible dans le store
  if (authStore.user) {
    deliveryAddress.value.nom = authStore.user.nom || '';
    deliveryAddress.value.prenom = authStore.user.prenom || '';
  }
});
</script>

<style scoped>
.bg-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style> 