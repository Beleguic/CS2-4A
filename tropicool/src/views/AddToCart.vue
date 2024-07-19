
<template>
  <div>
    <form v-if="isAvailable && isAuthenticated" @submit.prevent="addToCart">
      <div class="flex gap-4 flex-col">
        <div class="product-price">
          <label for="qty">Quantité</label>
          <div class="quantity-input-container">
            <button type="button" @click="decreaseQuantity" class="quantity-button">-</button>
            <input type="number" v-model="quantity" min="1" max="10" id="qty" class="quantity-input" :disabled="!isAvailable"/>
            <button type="button" @click="increaseQuantity" class="quantity-button">+</button>
          </div>
          <p>Prix Total: {{ totalPrice }} €</p>
        </div>
        <input type="hidden" name="product" id="product" :value="item">
        <button type="submit" class="add-to-cart-button">
          <img src="/Iconfrigo.png" alt="Cart Icon" class="cart-icon" />
          Ajouter au frigo
        </button>
      </div>
    </form>
    <div v-else-if="!isAuthenticated" class="border border-red-500">
      <p class="text-red-500 text-center px-4 py-2">Vous devez être connecté pour ajouter ce produit au panier</p>
    </div>  
    <div v-else class="border border-red-500">
      <p class="text-red-500 text-center px-4 py-2">
        Le produit n'est pas disponible
      </p>
    </div>
    <div v-if="message" :class="messageClass" class="mt-4 border">
      <p class="text-center px-4 py-2">{{ message }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
  import { ref, computed, onMounted } from 'vue';
  import axios from 'axios';
  import { useAuthStore } from '../stores/authStore';
  import { useAddToCartFormValidation } from '../composables/useAddToCartFormValidation';

  interface Props {
    item: string;
    price: number;
  }

  const props = defineProps<Props>();

  const quantity = ref<number>(1);
  const message = ref<string>('');
  const messageType = ref<string>('');
  const availableStock = ref<number>(0);
  const isAvailable = ref<boolean>(true);
  const isAuthenticated = ref<boolean>(false);

  const authStore = useAuthStore();

  const messageClass = computed(() => {
    return messageType.value === 'error' ? 'message error' : 'message success';
  });

  const totalPrice = computed(() => {
    return (props.price * quantity.value).toFixed(2);
  });

  const increaseQuantity = () => {
    if (quantity.value < 10) {
      quantity.value += 1;
    }
  };

  const decreaseQuantity = () => {
    if (quantity.value > 1) {
      quantity.value -= 1;
    }
  };

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
  .message.error {
    color: #f56565;
    border-color: #f56565;
  }
  .message.success {
    color: #48bb78;
    border-color:#48bb78;
  }

  .product-price {
    font-size: 22px;
    font-weight: 500;
    color: #1D1F96;
    margin-bottom: 30px;
  }

  .quantity-input-container {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .quantity-input {
    margin: 0 10px;
    width: 70px;
    padding: 10px;
    font-size: 18px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
    color: #000;
    text-align: center;
    -moz-appearance: textfield;
  }

  .quantity-input::-webkit-outer-spin-button,
  .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .quantity-button {
    width: 30px;
    height: 30px;
    background-color: #ccc;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
    color: #000;
    cursor: pointer;
    transition: background-color 0.3s;
  }

  .quantity-button:hover {
    background-color: #bbb;
  }

  .add-to-cart-button {
    background-color: #696BE2;
    color: #FEFEF6;
    font-size: 20px;
    font-weight: 500;
    padding: 15px 30px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }

  .add-to-cart-button:hover {
    background-color: #5756A1;
  }

  .cart-icon {
    width: 30px;
    height: 30px;
  }
</style>