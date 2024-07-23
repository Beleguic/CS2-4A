<template>
    <!--
    <div class="relative w-full bg-custom">
        <div class="flex flex-col items-center gap-4 min-h-screen">
            <div class="w-8/12">
                <h2 class="text-2xl font-bold mb-1 text-left text-main mb-4">Procéder au paiement</h2>
                <button @click="handlePayment" class="bg-main hover:bg-secondary text-white py-2 px-4 uppercase text-lg">Procéder au paiement</button>

            </div>
        </div>
    </div>-->
    <div class="relative w-full bg-custom">
        <div class="flex flex-col items-center gap-4 min-h-screen">
            <div class="w-full max-w-5xl bg-main p-8 rounded-3xl shadow-lg mb-16 grid gap-8">
                <h2 class="text-2xl font-bold mb-1 text-center text-main mb-4 text-white">Procéder au paiement</h2>
                <FormComponent
                    :fields="fields"
                    ref="form"
                    submitButtonText="Procéder au paiement"
                    @submit="handleSubmit"
                />
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import FormComponent from './FormComponent.vue';
import { useRoute } from 'vue-router';
import axios from "axios";
import {useAuthStore} from "../stores/authStore.ts";

const authStore = useAuthStore();
const isLoggedIn = ref(authStore.isLoggedIn);

const total = ref(0);
const tva = ref(0);

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
}

interface Stock {
    difference: string;
    product_id: string;
    quantity: number;
    status: "remove";
}

const route = useRoute();

const stripePromise = loadStripe('pk_test_51Pf1JALuibZ66sl2zkolBm8QingouYyjJHBLrsfWEEnlkm3WQLWBFAew6IWuXCDsR9EHMNbS5Qc9DTgvEGcpAKiF00ZxQnWYxV');
const errorMessage = ref('');
const loading = ref(false);
let cardElement: any;
const userId = ref('');

const apiUrl = import.meta.env.VITE_API_URL as string;

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
            [{ name:'same', label: "Même que l'adresse de livraison", type: 'checkbox', required: false, color: 'white', styleDiv: 'inline-flex', value: false }],
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
    const setupStripe = async () => {
        const stripe = await stripePromise;
        const elements = stripe ? stripe.elements() : null;
        if (elements) {
            cardElement = elements.create('card');
            cardElement.mount('#card-element');
        }
    };
    setupStripe();


});

onUnmounted(() => {
    if (cardElement) {
        // Destruction des informations bancaires
        cardElement.destroy();
    }
});

const handleSubmit = async () => {
    try {
        console.log('------------------------', userId.value);
        const responseCart = await axios.get(`${apiUrl}/cart/user/${userId.value}`, {
            headers: {
                'Content-Type': 'application/json',
            },
        });

        console.log('responseCart', responseCart);
        cart.value = responseCart.data;

    } catch (err) {
        errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
    } finally {
        loading.value = false;
    }

    console.log('cart', cart.value);



    loading.value = true;
    errorMessage.value = '';

    try {
        const response = await fetch(`${apiUrl}/stripe/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: total.value * 100 }), // Montant en cents
        });

        const { clientSecret } = await response.json();

        const stripe = await stripePromise;
        const { error } = await stripe.confirmCardPayment(clientSecret, {
            payment_method: {
                card: cardElement,
            },
        });

        if (error) {
            errorMessage.value = error.message;
        } else {

            const order: Order = {
                user_id: cart.value.user_id,
                products: cart.value.cartProductsData,
            };

            // Envoie la commande au serveur pour la sauvegarder
            const response = await axios.post(`${apiUrl}/order/new`, order);

            console.log(response.data);

            const stocks: Stock[] = [];

            for (const product of cart.value.cartProductsData) {
                let productId = product.product_id;

                try {
                    const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
                        params: { product_id: productId },
                    });
                    const stockData = stockResponse.data;
                    const latestStock = stockData.length ? stockData[stockData.length - 1] : null;

                    let newQuantity = latestStock ? latestStock.quantity - product.quantity : product.quantity;

                    stock.value = {
                        difference: `-${product.quantity}`,
                        product_id: product.product_id,
                        quantity: newQuantity,
                        status: 'remove',
                    };

                    const stockResponseNew = await axios.post(`${apiUrl}/stock/new`, stock.value, {
                        headers: {
                            'Content-Type': 'application/json',
                        }
                    });

                    console.log("stock move", stockResponseNew.data);

                } catch (error) {
                    console.error('Error fetching latest stock:', error);
                }
            }


            // Requete la poste pour recup le numero de livraison + ajouter livraison dans la poste
            // Ajouter dans le model order du numero de livraison
            console.log('Payment successful');
        }

    } catch (err) {
        errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};


/*


    */
</script>


<style scoped>
</style>
