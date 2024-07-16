<template>
  <div class="grid gap-4 w-full max-w-7xl mx-auto py-4 ">
    <h1 class="font-bold text-xl text-main">Mon Panier</h1>
    <div v-if="!isLoggedIn">
      <p>Vous devez être connecté pour voir votre panier.</p>
      <router-link to="/login" class="underline">Se connecter</router-link>
    </div>
    <div v-else>
      <div v-if="cartItems.length > 0">
        <div class="flex w-full gap-2">
          <CartTable :cartItems="cartItems" :removeFromCart="removeFromCart" @update-cart="fetchCart" />
          <CartResume 
            :promoCode="promoCode"
            :promoMessage="promoMessage"
            :reduction="reduction"
            :cartProductsData="cartItems"
            @update:promoCode="promoCode = $event"
            @update:reduction="reduction = $event"
            @update:promoMessage="promoMessage = $event"
          />
        </div>
      </div>
      <div v-else>
        <p>Votre panier est vide.</p>
        <div>
          Consulter nos <router-link :to="{ name: 'FrontProduct' }" class="underline">produits</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
  import CartTable from '../components/CartTable.vue';
  import CartResume from '../components/CartResume.vue';
  import { ref, onMounted, computed } from 'vue'
  import axios from 'axios'
  import { useAuthStore } from '../stores/authStore'

  interface Stock {
    id: string;
    product_id: string;
    quantity: number;
    status: string;
  }

  interface Cart {
    id: string;
    user_id: string;
    cartProductsData: CartItem[];
  }

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

  const cartItems = ref<CartItem[]>([])
  const authStore = useAuthStore()
  const isLoggedIn = ref(authStore.isLoggedIn)
  const cartId = ref<string | null>(null) 

  const apiUrl = import.meta.env.VITE_API_URL as string
  const userId = localStorage.getItem('userId')

  const promoCode = ref<string>('')
  const promoMessage = ref<string>('')
  const reduction = ref<number>(0)

  const fetchCart = async () => {
    if (isLoggedIn.value) {
      const response = await axios.get<Cart[]>(`${apiUrl}/cart`, {
        params: { user_id: userId }
      });
      if (response.data && Array.isArray(response.data)) {
        if (response.data.length > 0) {
          cartItems.value = response.data[0].cartProductsData
          cartId.value = response.data[0].id
        }
      }
    }
  }

  const removeFromCart = async (productId: string, quantity: number) => {
    if (isLoggedIn.value) {
      try {
        await axios.delete(`${apiUrl}/cart`, {
          data: { user_id: userId, product_id: productId }
        });

        cartItems.value = cartItems.value.filter(item => item.product_id !== productId);

        if (cartItems.value.length === 0 && cartId.value) {
          await axios.delete(`${apiUrl}/cart/${cartId.value}`);
          cartItems.value = [];
          cartId.value = null;
        }

        const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
          params: { product_id: productId }
        });
        const stockData = stockResponse.data;

        if (stockData.length > 0) {
          const lastStockEntry = stockData[stockData.length - 1];

          const updatedQuantity = lastStockEntry.quantity + quantity;

          await axios.post(`${apiUrl}/stock/new`, {
            product_id: productId,
            quantity: updatedQuantity,
            status: 'add'
          });
        } else {
          await axios.post(`${apiUrl}/stock/new`, {
            product_id: productId,
            quantity: quantity,
            status: 'add'
          });
        }
        
      } catch (error) {
        console.error("Failed to remove item from cart:", error);
      }
    }
  }

  onMounted(() => {
    fetchCart()
  })

  const total = computed(() => {
    return cartItems.value.reduce((acc, item) => acc + item.price * item.quantity, 0)
  })

  const discountedTotal = computed(() => {
    return total.value * ((100 - reduction.value) / 100)
  })

  const tvaBase = computed(() => {
    return total.value * 0.2
  })

  const tva = computed(() => {
    return discountedTotal.value * 0.2
  })
</script>

<style scoped>
  main {
    background-color: white !important;
  }
</style>