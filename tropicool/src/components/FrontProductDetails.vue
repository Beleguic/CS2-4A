<template>
  <div class="text-black">
    <h1>Product Details</h1>
    <section v-if="product">
      <h1>Name: <span class="capitalize">{{ product.name }}</span></h1>
      <p>Price: <span>{{ product.price }}€</span></p>
      <AddToCart 
        :item="product.id"
      />
    </section>
    <section v-else>
      <p>Loading...</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import AddToCart from '../views/AddToCart.vue'

interface Product {
  name: string;
  price: number;
  id: string;
}

const route = useRoute();
const product = ref<Product | null>(null);
const apiUrl = import.meta.env.VITE_API_URL as string;

onMounted(async () => {
  try {
    const response = await fetch(`${apiUrl}/product/${route.params.id}`);
    if (!response.ok) {
      throw new Error('Error fetching product');
    }
    product.value = await response.json() as Product;
  } catch (error) {
    console.error('Error fetching product:', error);
  }
});
</script>
