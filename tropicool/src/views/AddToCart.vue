<template>
  <div>
    <form v-if="isAvailable && isAuthenticated" @submit.prevent="addToCart">
      <div class="flex gap-4 flex-col">
        <div class="flex gap-4">
          <label for="qty">Quantité</label>
          <select name="qty" id="qty" v-model="quantity" :disabled="!isAvailable" class="p-2 block w-1/2 border border-gray-300 rounded-md shadow-sm">
            <option v-for="n in 10" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <button type="submit" class="bg-main text-white hover:bg-secondary py-2 px-4">Ajouter au panier</button>
        <input type="hidden" name="product" id="product" :value="item">
      </div>
    </form>
    <p v-else-if="!isAuthenticated" class="text-red-500">Vous devez être connecté pour ajouter ce produit au panier</p>
    <p v-else class="text-red-500">Le produit n'est pas disponible</p>
    <p v-if="message" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

interface Props {
  item: string;
}

const props = defineProps<Props>();

const quantity = ref<number>(1);
const message = ref<string>('');
const messageType = ref<string>('');
const availableStock = ref<number>(0);
const isAvailable = ref<boolean>(true);
const isAuthenticated = ref<boolean>(false);

const messageClass = computed(() => {
  return messageType.value === 'error' ? 'text-red-500' : 'text-green-500';
});

import { useAddToCartFormValidation } from '../composables/useAddToCartFormValidation';

const authStore = useAuthStore();

const checkStock = async (productId: string): Promise<number> => {
  const apiUrl = import.meta.env.VITE_API_URL as string;
  try {
    const response = await axios.get(`${apiUrl}/stock`, { params: { product_id: productId } });
    const stockData = response.data;
    const latestStock = stockData[stockData.length - 1];
    return latestStock ? latestStock.quantity : 0;
  } catch (error) {
    console.error("Error fetching stock:", error);
    return 0;
  }
};

const addToCart = async () => {
  try {
    if (quantity.value > availableStock.value) {
      message.value = `Stock insuffisant. Disponible: ${availableStock.value}`;
      messageType.value = 'error';
      return;
    }

    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.value = 'Vous devez être connecté pour ajouter ce produit au panier';
      messageType.value = 'error';
      return;
    }

    const response = await useAddToCartFormValidation(props.item, quantity.value, userId);
    message.value = response.message.error ?? response.message.success ?? 'Unexpected response';
    messageType.value = response.message.error ? 'error' : 'success';
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    } else {
      message.value = 'An unexpected error occurred';
    }
    messageType.value = 'error';
  }
};

onMounted(async () => {
  isAuthenticated.value = authStore.isLoggedIn;

  const stock = await checkStock(props.item);
  availableStock.value = stock;
  isAvailable.value = stock > 0;
});
</script>

<style scoped>
.text-red-500 {
  color: #f56565;
}
.text-green-500 {
  color: #48bb78;
}
</style>