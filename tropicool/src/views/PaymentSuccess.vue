<template>
    <div class="min-h-screen bg-beige flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="mb-6">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                    <svg class="h-6 w-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                    </svg>
                </div>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Paiement Réussi !</h1>
            <p class="text-gray-600 mb-6">
                Votre commande a été traitée avec succès. Vous recevrez un email de confirmation sous peu.
            </p>
            
            <div v-if="sessionDetails" class="mb-6 p-4 bg-gray-50 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Détails de la commande</h3>
                <p class="text-sm text-gray-600">
                    <strong>Montant :</strong> {{ formatPrice(sessionDetails.amount_total) }}
                </p>
                <p class="text-sm text-gray-600">
                    <strong>Statut :</strong> {{ sessionDetails.payment_status }}
                </p>
            </div>
            
            <div class="space-y-3">
                <button 
                    @click="goToOrders" 
                    class="w-full bg-main hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Voir mes commandes
                </button>
                
                <button 
                    @click="goHome" 
                    class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useStripeCheckout } from '../composables/useStripeCheckout';

const route = useRoute();
const router = useRouter();
const { getSessionDetails } = useStripeCheckout();

const sessionDetails = ref(null);
const loading = ref(true);

const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount / 100);
};

const goToOrders = () => {
    router.push('/orders');
};

const goHome = () => {
    router.push('/');
};

onMounted(async () => {
    const sessionId = route.query.session_id as string;
    
    if (sessionId) {
        try {
            const details = await getSessionDetails(sessionId);
            sessionDetails.value = details;
        } catch (error) {
            console.error('Erreur lors de la récupération des détails de la session:', error);
        }
    }
    
    loading.value = false;
});
</script>
