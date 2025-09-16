import { ref } from 'vue';
import axios from 'axios';

interface CartItem {
    product_id: string;
    name: string;
    price: number;
    quantity: number;
    image?: string;
}

interface CheckoutSessionData {
    cartItems: CartItem[];
    userId: string;
    successUrl: string;
    cancelUrl: string;
    livraisonNumber?: string;
    adresseFacturation?: any;
}

export function useStripeCheckout() {
    const loading = ref(false);
    const error = ref<string | null>(null);

    const createCheckoutSession = async (data: CheckoutSessionData) => {
        loading.value = true;
        error.value = null;

        try {
            const apiUrl = import.meta.env.VITE_API_URL as string;
            
            const response = await axios.post(`${apiUrl}/stripe/create-checkout-session`, data, {
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.error || 'Erreur lors de la création de la session de paiement';
            throw err;
        } finally {
            loading.value = false;
        }
    };

    const redirectToCheckout = (checkoutUrl: string) => {
        window.location.href = checkoutUrl;
    };

    const getSessionDetails = async (sessionId: string) => {
        try {
            const apiUrl = import.meta.env.VITE_API_URL as string;
            
            const response = await axios.get(`${apiUrl}/stripe/session/${sessionId}`);
            return response.data;
        } catch (err: any) {
            error.value = err.response?.data?.error || 'Erreur lors de la récupération des détails de la session';
            throw err;
        }
    };

    return {
        loading,
        error,
        createCheckoutSession,
        redirectToCheckout,
        getSessionDetails,
    };
}
