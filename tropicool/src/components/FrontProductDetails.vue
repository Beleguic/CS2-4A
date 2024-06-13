<template>
  <div class="text-black max-w-7xl w-full py-4 mx-auto">
    <h1>Product Details</h1>
    <section v-if="product">
      <h1>Name: <span class="capitalize">{{ product.name }}</span></h1>
      <p>Price: <span>{{ product.price }}€</span></p>
      <AddToCart 
        :item="product.id"
        :price="product.price"
      />
    </section>
    <section v-else>
      <p>Loading...</p>
    </section>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import AddToCart from '../views/AddToCart.vue'

interface Product {
  name: string;
  price: number;
  id: string;
}

const route = useRoute();
const router = useRouter();
const product = ref<Product | null>(null);
const apiUrl = import.meta.env.VITE_API_URL as string;

onMounted(async () => {
  try {
    const response = await fetch(`${apiUrl}/product/${route.params.id}?frontend=true`);
    if (!response.ok) {
      throw new Error('Error fetching product');
    }
    const data = await response.json();
    if (data.is_active) {
      product.value = data;
    } else {
      router.push({ name: 'Product' });
    }
  } catch (error) {
    router.push({ name: 'Product' });
    console.error('Error fetching product:', error);
  }
});
</script>
