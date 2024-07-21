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
                    @submit="handlePayment"
                />
            </div>
        </div>
    </div>

</template>

<script setup lang="ts">
/*
import { ref, watch, onMounted, nextTick } from 'vue';
import FormComponent from '../components/FormComponent.vue';
import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51Pf1JALuibZ66sl2zkolBm8QingouYyjJHBLrsfWEEnlkm3WQLWBFAew6IWuXCDsR9EHMNbS5Qc9DTgvEGcpAKiF00ZxQnWYxV');
console.log(stripePromise);
const form = ref(null);



/*onMounted(() => {
    nextTick(() => {
        watch(() => form.value?.getFieldValue('same'), (newVal) => {
            if (newVal) {
                const shippingFields = ['nom', 'prenom', 'societe', 'adresse', 'adresse2', 'ville', 'code_postale', 'telephone'];
                shippingFields.forEach(field => {
                    form.value.setFieldValue(`${field}_facturation`, form.value.getFieldValue(field));
                });
            } else {
                const billingFields = ['nom_facturation', 'prenom_facturation', 'societe_facturation', 'adresse_facturation', 'adresse2_facturation', 'ville_facturation', 'code_postale_facturation', 'telephone_facturation'];
                billingFields.forEach(field => {
                    form.value.setFieldValue(field, '');
                });
            }
        });
    });
});*/
/*
const handlePayment = async () => {
    const stripe = await stripePromise;

    const response = await fetch('http://localhost:3000/stripe/new', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: 5000 }), // Montant en cents, donc 5000 cents = 50 dollars
    });

    const { clientSecret } = await response.json();

    if (stripe) {
    const { error } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
            card: {
                number: '4242424242424242',
                exp_month: 12,
                exp_year: 2024,
                cvc: '123',
            },
        },
    });
    
      if (error) {
        console.error(error.message);
      } else {
        console.log('Payment successful');
      }
    }
};*/

import { ref, onMounted, onUnmounted } from 'vue';
import { loadStripe } from '@stripe/stripe-js';
import FormComponent from './FormComponent.vue';

const stripePromise = loadStripe('pk_test_51Pf1JALuibZ66sl2zkolBm8QingouYyjJHBLrsfWEEnlkm3WQLWBFAew6IWuXCDsR9EHMNbS5Qc9DTgvEGcpAKiF00ZxQnWYxV');
const errorMessage = ref('');
const loading = ref(false);
let cardElement: any;

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
            [{ name: 'payment', label: 'Information de paiement', type: 'payment', required: true,  color: 'white' }],
        ],
    }
];

onMounted(() => {
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
    cardElement.destroy();
  }
});

const handleSubmit = async () => {
    loading.value = true;
    errorMessage.value = '';

    try {
        const response = await fetch(`${apiUrl}/stripe/new`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ amount: 5000 }), // Montant en cents
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
            console.log('Payment successful');
        }

    } catch (err) {
        errorMessage.value = 'Une erreur est survenue. Veuillez réessayer.';
        console.error(err);
    } finally {
        loading.value = false;
    }
};
</script>

<style scoped>
</style>
