<template>
  <div class="grid gap-4 w-full max-w-7xl mx-auto">
    <h1 class="font-bold text-xl text-main">Mon Panier</h1>
    <div v-if="cartItems.length > 0 || !cartItems">
      <div class="flex w-full">
        <section class="w-3/4">
          <div>
            <div class="flex">
              <div class="font-bold w-1/2">Produit</div>
              <div class="font-bold w-1/6">Prix</div>
              <div class="font-bold w-1/6">Quantité</div>
              <div class="font-bold w-1/6">Total</div>
            </div>
            <div
              class="flex py-4"
              v-for="item in cartItems" :key="item.product_id">
              <div class="w-1/2 flex gap-4">
                <div>
                  <img
                    class="max-w-20 w-full"
                    :src="item.image"
                    alt="Produit"
                  >
                </div>
                <div>
                  <h3>{{ item.name }}</h3>
                  <p class="text-gray-600">{{ item.product_id }}</p>
                </div>
              </div>
              <div class="w-1/6">
                <span>{{ item.price }}€</span>
              </div>
              <div class="w-1/6">
                <span>{{ item.quantity }}</span></div>
              <div class="w-1/6">
                <span>€{{ (item.price * item.quantity).toFixed(2) }}</span>
              </div>
            </div>
          </div>
        </section>
        <section class="w-1/4">
          <div class="grid gap-4 h-full">
            <h1 class="font-bold text-xl">Résumé</h1>
            <div class="flex justify-between">
              <span class="font-bold">Total</span>
              <span>{{ total.toFixed(2) }} €</span>
            </div>
            <div class="flex justify-between">
              <span class="font-bold">TVA</span>
              <span>{{ tva.toFixed(2) }} €</span>
            </div>
            <p class="text-xs">Calcul des frais de ports lors de la procédure de paiement</p>
          </div>
          <div class="grid gap-4">
            <h1 class="font-bold text-xl">Code Promo</h1>
            <form>
              <input type="text" name="promo" id="promo">
              <button type="submit">Appliquer</button>
            </form>
          </div>
        </section>
      </div>
    </div>
    <div v-else>
      <p>Votre panier est vide.</p>
      <div>
        consulter nos <router-link :to="{name : 'Product'}" class="underline">produits</router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import axios from 'axios'

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
}

const cartItems = ref<CartItem[]>([])

const apiUrl = import.meta.env.VITE_API_URL as string
const userId = localStorage.getItem('userId')

const fetchCart = async () => {
  const response = await axios.get<Cart[]>(`${apiUrl}/cart`, {
    params: { user_id: userId }
  });
  if (response.data && Array.isArray(response.data)) {
    if (response.data.length > 0) {
      cartItems.value = response.data[0].cartProductsData
    }
  }
}

onMounted(() => {
  fetchCart()
})

const total = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.price * item.quantity, 0)
})

const tva = computed(() => {
  return total.value * 0.2
})
</script>

<style scoped>
main {
  background-color: white !important;
}
</style>