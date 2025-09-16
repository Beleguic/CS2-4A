<template>
    <div class="relative w-full bg-custom">
        <div class="flex flex-col items-center gap-4 min-h-screen">
            <div class="w-full max-w-5xl bg-main p-8 rounded-3xl shadow-lg mb-16 grid gap-8">
                <h2 class="text-2xl font-bold mb-1 text-center text-main mb-4 text-white">Procéder au paiement</h2>
                <FormComponent
                    :fields="fields"
                    ref="form"
                    v-model:formData="fields"
                    submitButtonText="Procéder au paiement"
                    @submit="handleSubmit"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import FormComponent from './FormComponent.vue';
import { useRoute, useRouter } from 'vue-router';
import axios from "axios";
import { useAuthStore } from "../stores/authStore.ts";
import { useStripeCheckout } from "../composables/useStripeCheckout.ts";

const authStore = useAuthStore();
const { createCheckoutSession, redirectToCheckout, loading: stripeLoading, error: stripeError } = useStripeCheckout();

const router = useRouter();

const total = ref(0);
const tva = ref(0);
const livraisonNumber = ref('');

const cartItems = ref<CartItem[]>([]);
const cartId = ref<string | null>(null);

interface CartItem {
    product_id: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    reference: string;
    tva: number;
    is_adult: boolean;
}

interface Cart {
    id: string;
    user_id: string;
    cartProductsData: CartItem[];
}

interface Order {
    user_id: string;
    products: CartItem[];
    total: number;
    tva: number;
    isPayed: boolean;
    livraison: string;
    adresseFacturation: JSON;
}

interface Stock {
    difference: string;
    product_id: string;
    quantity: number;
    status: "remove";
}

interface livraison{
    expiditeur: JSON;
    destinataire: JSON;
}

const route = useRoute();

const errorMessage = ref('');
const loading = ref(false);
const userId = ref('');

const apiUrl = import.meta.env.VITE_API_URL as string;
const posteUrl = import.meta.env.VITE_POSTE_API_URL as string;

const cart = ref<Cart>({
    id: '',
    user_id: '',
    cartProductsData: [],
});

const stock = ref<Stock>({
    difference: '',
    product_id: '',
    quantity: 0,
    status: 'remove',
});

const livraison = ref<livraison>({
    expediteur: {},
    destinataire: {}
});

const fields = [
    {
        header: 'Adresse de livraison',
        field: [
            [{ name: 'nom', label: 'Nom', type: 'text', required: true,  color: 'white' },{ name: 'prenom', label: 'Prénom', type: 'text', required: true,  color: 'white' }],
            [{ name: 'societe', label: 'Société (optionnel)', type: 'text', required: false, color: 'white' }],
            [{ name: 'adresse', label: 'Adresse', type: 'text', required: true,  color: 'white' }],
            [{ name: 'adresse2', label: "Bâtiment, appartement etc (optionnel)", type: 'text', required: false,  color: 'white' }],
            [{ name: 'ville', label: 'Ville', type: 'text', required: true, color: 'white'},{ name: 'code_postale', label: 'Code postal', type: 'number', required: true,  color: 'white'}],
            [{ name: 'telephone', label: 'Téléphone', type: 'tel', required: true, color: 'white' }],
        ],
    },
    {
        header: 'Adresse de Facturation',
        field: [
            [{ name: 'nom_facturation', label: 'Nom', type: 'text', required: true,  color: 'white' },{ name: 'prenom_facturation', label: 'Prénom', type: 'text', required: true,  color: 'white' }],
            [{ name: 'societe_facturation', label: 'Société (optionnel)', type: 'text', required: false,  color: 'white' }],
            [{ name: 'adresse_facturation', label: 'Adresse', type: 'text', required: true,  color: 'white' }],
            [{ name: 'adresse2_facturation', label: "Bâtiment, appartement etc (optionnel)", type: 'text', required: false,  color: 'white' }],
            [{ name: 'ville_facturation', label: 'Ville', type: 'text', required: true, color: 'white' },{ name: 'code_postale_facturation', label: 'Code postal', type: 'number', required: true, widthInput: '40%', color: 'white'}],
            [{ name: 'telephone_facturation', label: 'Téléphone', type: 'tel', required: true,  color: 'white' }],
        ],
    },
    {
        header: 'Information Bancaire',
        field: [
            [{ name: 'payment', label: 'Information de paiement', type: 'payment', required: false,  color: 'white' }],
        ],
    }
];

onMounted(() => {
    userId.value = route.query.user_id as string;
    total.value = route.query.total as string;
    tva.value = route.query.tva as string;
});

const handleSubmit = async (formData) => {
    console.log('formData', formData);
    
    loading.value = true;
    errorMessage.value = '';

    try {
        // Préparer les adresses
        const addrLivraison = {
            "nom": formData.nom,
            "prenom": formData.prenom,
            "societe": formData.societe,
            "adresse": formData.adresse,
            "adresse2": formData.adresse2,
            "ville": formData.ville,
            "code_postale": formData.code_postale,
            "telephone": formData.telephone
        };
        
        const addrFacturation = {
            "nom": formData.nom_facturation,
            "prenom": formData.prenom_facturation,
            "societe": formData.societe_facturation,
            "adresse": formData.adresse_facturation,
            "adresse2": formData.adresse2_facturation,
            "ville": formData.ville_facturation,
            "code_postale": formData.code_postale_facturation,
            "telephone": formData.telephone_facturation
        };
        
        const addrExpedition = {
            "nom_entreprise": "Troupicool",
            "adresse": "1 rue du confinement",
            "code_postal": "75012",
            "ville": "Paris",
            "pays": "France"
        };

        // Créer la livraison
        livraison.value.destinataire = addrLivraison;
        livraison.value.expediteur = addrExpedition;

        const responseLivraison = await fetch(`${posteUrl}/api/livraisons/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(livraison.value),
        });
        
        const livraisonData = await responseLivraison.json();
        livraisonNumber.value = livraisonData.livraison;

        // Récupérer le panier
        const responseCart = await axios.get(`${apiUrl}/cart/user/${userId.value}`);
        cart.value = responseCart.data;

        // Préparer les URLs de redirection
        const baseUrl = window.location.origin;
        const successUrl = `${baseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`;
        const cancelUrl = `${baseUrl}/payment-cancel`;

        // Créer la session Stripe Checkout
        const checkoutData = {
            cartItems: cart.value.cartProductsData,
            userId: cart.value.user_id,
            successUrl,
            cancelUrl,
            livraisonNumber: livraisonNumber.value,
            adresseFacturation: addrFacturation
        };

        const { url } = await createCheckoutSession(checkoutData);
        
        // Rediriger vers Stripe Checkout
        redirectToCheckout(url);

    } catch (err) {
        errorMessage.value = err.message || 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>


<style scoped>
</style>
