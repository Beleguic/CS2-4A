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
            :user_id="userId"
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
  import CartTable from  '../components/CartTable.vue';
  import CartResume from '../components/CartResume.vue';
  import { ref, onMounted, computed } from 'vue';
  import { useAuthStore } from '../stores/authStore';
  import { useToast } from 'vue-toast-notification';

  const $toast = useToast();

  interface Stock {
    id: string;
    product_id: string;
    quantity: number;
    status: string;
    difference: string;
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

  const cartItems = ref<CartItem[]>([]);
  const authStore = useAuthStore();
  const isLoggedIn = ref(authStore.isLoggedIn);
  const cartId = ref<string | null>(null);

  const apiUrl = import.meta.env.VITE_API_URL as string;
  const token = (localStorage.getItem('token') as string) ?? '';
  const userId = (localStorage.getItem('userId') as string) ?? '';
  const promoCode = ref<string>('');
  const promoMessage = ref<string>('');
  const reduction = ref<number>(0);

  const fetchCart = async () => {
    if (isLoggedIn.value) {
      const response = await fetch(`${apiUrl}/carts?user_id=${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (response.status === 200) {
        const data: Cart[] = await response.json();
        if (data.length > 0) {
          cartItems.value = data[0].cartProductsData;
          cartId.value = data[0].id;
        }
      }
    }
  };

  const calculateDifference = (oldQuantity: number, newQuantity: number) => {
    return (newQuantity - oldQuantity).toString();
  };

  const removeFromCart = async (productId: string, quantity: number) => {
    if (isLoggedIn.value) {
      try {
        await fetch(`${apiUrl}/carts`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ user_id: userId, product_id: productId }),
        });

        cartItems.value = cartItems.value.filter(item => item.product_id !== productId);

        if (cartItems.value.length === 0 && cartId.value) {
          await fetch(`${apiUrl}/carts/${cartId.value}`, {
            method: 'DELETE',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });
          cartItems.value = [];
          cartId.value = null;
        }

        const stockResponse = await fetch(`${apiUrl}/stock?product_id=${productId}`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (stockResponse.ok) {
          const stockData: Stock[] = await stockResponse.json();
          if (stockData.length > 0) {
            const lastStockEntry = stockData[stockData.length - 1];
            const updatedQuantity = lastStockEntry.quantity + quantity;
            const difference = calculateDifference(lastStockEntry.quantity, updatedQuantity);

            await fetch(`${apiUrl}/stock/new`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                product_id: productId,
                quantity: updatedQuantity,
                status: 'add',
                difference: difference,
              }),
            });

            $toast.open({
              message: 'Panier mise-à-jour !',
              type: 'success',
              position: 'bottom-left',
            });
          }
        }
      } catch (error) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
      }
    }
  };

  onMounted(() => {
    fetchCart();
  });

  const total = computed(() => {
    return cartItems.value.reduce((acc, item) => acc + item.price * item.quantity, 0);
  });

  const discountedTotal = computed(() => {
    return total.value * ((100 - reduction.value) / 100);
  });

  const tvaBase = computed(() => {
    return total.value * 0.2;
  });

  const tva = computed(() => {
    return discountedTotal.value * 0.2;
  });
</script>

<style scoped>
  main {
    background-color: white !important;
  }
</style>