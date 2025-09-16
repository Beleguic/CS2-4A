<template>
    <div class="min-h-screen bg-beige flex items-center justify-center">
        <div class="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
            <div class="mb-6">
                <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                    <svg class="h-6 w-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                    </svg>
                </div>
            </div>
            
            <h1 class="text-2xl font-bold text-gray-900 mb-4">Paiement Annulé</h1>
            <p class="text-gray-600 mb-6">
                Votre paiement a été annulé. Aucun montant n'a été débité de votre compte.
            </p>
            
            <div class="space-y-3">
                <button 
                    @click="retryPayment" 
                    class="w-full bg-main hover:bg-secondary text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Réessayer le paiement
                </button>
                
                <button 
                    @click="goToCart" 
                    class="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Retour au panier
                </button>
                
                <button 
                    @click="goHome" 
                    class="w-full text-gray-600 hover:text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
                >
                    Retour à l'accueil
                </button>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

const retryPayment = () => {
    // Rediriger vers la page de paiement avec les mêmes paramètres
    router.go(-1);
};

const goToCart = () => {
    router.push('/cart');
};

const goHome = () => {
    router.push('/');
};
</script>
