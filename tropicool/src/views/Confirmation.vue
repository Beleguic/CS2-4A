<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4 min-h-screen">
      <div class="w-full max-w-4xl bg-white p-8 rounded-3xl shadow-lg mb-16">
        
        <!-- En-tête -->
        <div class="text-center mb-8">
          <div v-if="loading" class="flex justify-center mb-4">
            <svg class="animate-spin h-12 w-12 text-main" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
          
          <div v-else-if="paymentSuccess" class="mb-4">
            <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-green-600 mb-2">Paiement confirmé !</h1>
            <p class="text-gray-600">Votre commande a été traitée avec succès.</p>
          </div>
          
          <div v-else class="mb-4">
            <div class="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg class="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </div>
            <h1 class="text-3xl font-bold text-red-600 mb-2">Paiement échoué</h1>
            <p class="text-gray-600">Une erreur est survenue lors du traitement de votre paiement.</p>
          </div>
        </div>

        <!-- Détails de la commande -->
        <div v-if="orderDetails && paymentSuccess" class="bg-gray-50 rounded-lg p-6 mb-6">
          <h2 class="text-xl font-semibold mb-4 text-gray-800">Détails de votre commande</h2>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span class="text-sm font-medium text-gray-600">Numéro de commande:</span>
              <p class="text-lg font-semibold text-gray-800">{{ orderDetails.id }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Date:</span>
              <p class="text-lg font-semibold text-gray-800">{{ formatDate(orderDetails.created_at) }}</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Total:</span>
              <p class="text-lg font-semibold text-main">{{ formatPrice(orderDetails.total) }} €</p>
            </div>
            <div>
              <span class="text-sm font-medium text-gray-600">Statut:</span>
              <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Payée
              </span>
            </div>
          </div>
        </div>

        <!-- Produits commandés -->
        <div v-if="orderDetails && paymentSuccess" class="mb-6">
          <h3 class="text-lg font-semibold mb-4 text-gray-800">Produits commandés</h3>
          <div class="space-y-4">
            <div 
              v-for="product in orderDetails.products" 
              :key="product.product_id"
              class="flex items-center space-x-4 p-4 bg-white border border-gray-200 rounded-lg"
            >
              <img 
                :src="product.image" 
                :alt="product.name"
                class="w-16 h-16 object-cover rounded-lg"
              />
              <div class="flex-1">
                <h4 class="font-medium text-gray-800">{{ product.name }}</h4>
                <p class="text-sm text-gray-600">Référence: {{ product.reference }}</p>
                <p class="text-sm text-gray-600">Quantité: {{ product.quantity }}</p>
              </div>
              <div class="text-right">
                <p class="font-semibold text-gray-800">{{ formatPrice(product.price * product.quantity) }} €</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            @click="goToHome"
            class="bg-main hover:bg-secondary text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Retour à l'accueil
          </button>
          
          <button 
            v-if="paymentSuccess"
            @click="downloadInvoice"
            class="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Télécharger la facture
          </button>
          
          <button 
            v-if="!paymentSuccess"
            @click="retryPayment"
            class="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-colors duration-200"
          >
            Réessayer le paiement
          </button>
        </div>

        <!-- Message d'erreur -->
        <div v-if="errorMessage" class="mt-6 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {{ errorMessage }}
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

// Références réactives
const loading = ref(true);
const paymentSuccess = ref(false);
const orderDetails = ref(null);
const errorMessage = ref('');

// Formatage des prix
const formatPrice = (price: number) => {
  return price.toFixed(2);
};

// Formatage des dates
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

// Vérifier le statut du paiement
const checkPaymentStatus = async () => {
  const sessionId = route.query.session_id;
  
  if (!sessionId) {
    // Pas de session Stripe, vérifier par order_id
    const orderId = route.query.id_order;
    if (orderId) {
      await checkOrderStatus(orderId);
    } else {
      errorMessage.value = 'Aucune information de commande trouvée';
      loading.value = false;
    }
    return;
  }

  try {
    // Récupérer les détails de la session Stripe
    const sessionResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/stripe/session/${sessionId}`
    );
    
    const session = sessionResponse.data;
    
    if (session.payment_status === 'paid') {
      paymentSuccess.value = true;
      // Récupérer les détails de la commande
      if (session.metadata?.order_id) {
        await checkOrderStatus(session.metadata.order_id);
      }
    } else {
      paymentSuccess.value = false;
      errorMessage.value = 'Le paiement n\'a pas été complété avec succès';
    }
  } catch (error) {
    console.error('Error checking payment status:', error);
    errorMessage.value = 'Erreur lors de la vérification du statut du paiement';
  } finally {
    loading.value = false;
  }
};

// Vérifier le statut de la commande
const checkOrderStatus = async (orderId: string) => {
  try {
    const orderResponse = await axios.get(
      `${import.meta.env.VITE_API_URL}/order/${orderId}`
    );
    orderDetails.value = orderResponse.data;
  } catch (error) {
    console.error('Error fetching order details:', error);
  }
};

// Navigation
const goToHome = () => {
  router.push('/');
};

const retryPayment = () => {
  router.push('/cart');
};

const downloadInvoice = () => {
  // Logique pour télécharger la facture
  console.log('Downloading invoice for order:', orderDetails.value?.id);
  // Ici vous pouvez implémenter la génération et le téléchargement de la facture
};

// Initialisation
onMounted(() => {
  checkPaymentStatus();
});
</script>

<style scoped>
.bg-custom {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
}
</style>
  