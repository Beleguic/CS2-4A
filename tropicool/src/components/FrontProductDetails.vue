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
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

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
    const productId = route.params.id as string;
    
    if (!productId) {
      $toast.open({
        message: 'ID de produit manquant',
        type: 'error',
        position: 'bottom-left',
      });
      router.push({ name: 'Product' });
      return;
    }

    const response = await fetch(`${apiUrl}/product/${productId}?frontend=true`);
    console.log('response', response);
    
    if (!response.ok) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
      router.push({ name: 'Product' });
      return;
    }

    const data = await response.json();
    if (data.is_active) {
      product.value = data
    } else {
      router.push({ name: 'Product' });
    }
  } catch (error) {
    console.error('Erreur lors du chargement du produit:', error);
    router.push({ name: 'Product' });
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    }); 
  }
});
</script>
