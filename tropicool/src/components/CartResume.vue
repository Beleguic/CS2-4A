<template>
  <section class="grid gap-8 py-4">
    <div class="grid gap-4">
      <h1 class="font-bold text-xl text-main">Résumé</h1>
      <div class="flex justify-between">
        <span class="font-bold">Total</span>
        <span>{{ total.toFixed(2) }} €</span>
      </div>
      <div class="flex justify-between">
        <span class="font-bold">TVA</span>
        <span>{{ tvaBase.toFixed(2) }} €</span>
      </div>
      <p class="text-xs">Calcul des frais de ports lors du paiement</p>
    </div>
    <div class="grid gap-4">
      <h1 class="font-bold text-xl text-main">Code Promo</h1>
      <form @submit.prevent="handleApplyPromoCode" class="flex gap-2">
        <input type="text" v-model="localPromoCode" name="promo" id="promo" class="px-4 py-2 border-black border">
        <button type="submit" class="bg-main hover:bg-secondary text-white px-4 py-2">Appliquer</button>
      </form>
      <div v-if="reduction > 0">
        <button @click="handleRemovePromoCode" class="text-white bg-main hover:bg-secondary flex gap-4 px-2 py-1 items-center">
          <span>{{ appliedPromoCode }}</span>
          <component :is="iconCross" class="w-full max-w-5" />
        </button>
      </div>
    </div>
    <div class="grid gap-4">
      <h1 class="font-bold text-xl text-main">Soit</h1>
      <div class="flex justify-between">
        <span class="font-bold">Total</span>
        <span>{{ updatedTotal.toFixed(2) }} €</span>
      </div>
      <div class="flex justify-between">
        <span class="font-bold">TVA</span>
        <span>{{ updatedTva.toFixed(2) }} €</span>
      </div>
      <div>
        <p v-if="promoMessage" class="text-xs">{{ promoMessage }}</p>
      </div>
      <button class="bg-secondary hover:bg-main text-white py-2 px-4 uppercase text-lg" @click="submitCart">Procéder au paiement</button>
    </div>
  </section>
</template>

<script setup lang="ts">
import iconCross from '../assets/icons/cross.svg';
import { computed, ref } from 'vue';
import axios from 'axios';
import { defineProps, defineEmits } from 'vue';
import { useRouter } from 'vue-router';

interface PromotionCode {
  code: string;
  reduction: number;
}

interface CartProduct {
  product_id: string;
  name: string;
  quantity: number;
  price: number;
  image: string;
  reference: string;
  is_adult: boolean;
  tva: number;
}

interface Order {
  user_id: string;
  products: CartProduct[];
}

const props = defineProps({
  promoCode: {
    type: String,
    default: ''
  },
  promoMessage: {
    type: String,
    default: ''
  },
  reduction: {
    type: Number,
    default: 0
  },
  cartProductsData: {
    type: Array as () => CartProduct[],
    default: () => []
  },
  user_id: {
    type: String,
    required: true
  }
});

const emit = defineEmits(['update:promoCode', 'update:reduction', 'update:promoMessage']);

const router = useRouter(); // Utiliser le routeur

const localPromoCode = ref(props.promoCode);
const appliedPromoCode = ref(props.promoCode);

const handleApplyPromoCode = async () => {
  if (!localPromoCode.value) {
    emit('update:promoMessage', 'Code promo invalide');
    emit('update:reduction', 0);
    return;
  }

  const apiUrl = import.meta.env.VITE_API_URL as string;
  try {
    const response = await axios.get<PromotionCode[]>(`${apiUrl}/promotion_code`, {
      params: { code: localPromoCode.value }
    });

    if (response.data.length === 1 && typeof response.data[0].reduction === 'number') {
      emit('update:reduction', response.data[0].reduction);
      emit('update:promoMessage', `Code promo appliqué avec succès : réduction de ${response.data[0].reduction}%`);
      appliedPromoCode.value = localPromoCode.value;
    } else {
      emit('update:reduction', 0);
      emit('update:promoMessage', 'Code promo invalide');
    }
  } catch (error) {
    emit('update:promoMessage', 'Erreur lors de l\'application du code promo');
    emit('update:reduction', 0);
  }
};

const handleRemovePromoCode = () => {
  emit('update:reduction', 0);
  emit('update:promoMessage', 'Code promo supprimé');
  appliedPromoCode.value = '';
  emit('update:promoCode', '');
  setTimeout(() => {
    emit('update:promoMessage', '');
  }, 1000);
};

const total = computed(() => {
  return props.cartProductsData.reduce((acc, product) => acc + (product.price * product.quantity), 0);
});

const tvaBase = computed(() => {
  return props.cartProductsData.reduce((acc, product) => acc + (product.price * product.quantity * (product.tva / 100)), 0);
});

const updatedTotal = computed(() => {
  return total.value * ((100 - props.reduction) / 100);
});

const updatedTva = computed(() => {
  return props.cartProductsData.reduce((acc, product) => {
    const discountedPrice = product.price * ((100 - props.reduction) / 100);
    return acc + (discountedPrice * product.quantity * (product.tva / 100));
  }, 0);
});

const submitCart = async () => {
  try {
    // Crée une commande basée sur le panier actuel
    const order: Order = {
      user_id: props.user_id,
      products: props.cartProductsData,
    };

    // Envoie la commande au serveur pour la sauvegarder
    const apiUrl = import.meta.env.VITE_API_URL as string;
    const response = await axios.post(`${apiUrl}/order/new`, order);

    if (response.status === 201) {
      console.log("Order submitted successfully");
      // Rediriger vers la page de paiement
      router.push({ name: 'Payment' });
    } else {
      console.error("Failed to submit order", response);
    }
  } catch (error) {
    console.error("Error submitting cart", error);
  }
};
</script>

<style scoped>
.text-red-500 {
  color: #f56565;
}
.text-green-500 {
  color: #48bb78;
}
</style>
