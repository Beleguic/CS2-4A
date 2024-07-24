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
  import { useRouter, useRoute } from 'vue-router';
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
  const token = localStorage.getItem('token');

  onMounted(async () => {
    try {
      const response = await fetch(`${apiUrl}/product/${route.params.id}?frontend=true`, {
        method: "GET",
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.status !== 200) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        }); 
      }

      const data = await response.json();
      if (data.is_active) {
        product.value = data
      } else {
        router.push({ name: 'Product' });
      }
    } catch (error) {
      router.push({ name: 'Product' });
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
    }
  });
</script>