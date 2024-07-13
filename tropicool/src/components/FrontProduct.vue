<template>
    <div class="max-w-7xl w-full py-4 mx-auto">
      <h1 class="text-4xl font-bold mb-8 text-black">Tous les produits</h1>
      <section id="products">
        <template v-if="products.length > 0">
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-row gap-8 flex-wrap py-4">
          <Cards 
            v-for="product in products" 
            :key="product.id" 
            :name="product.name"
            :price="product.price"
            :image="product.image || '../uploads/temporary-image.jpg'"
            path="FrontProductDetails"
          />
        </ul>
        </template>
        <template v-else>
            <p class="text-center text-gray-500 w-full">Pas de produit trouvée</p>
          </template>
      </section>
    </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Cards from '../components/CardsComponentTest.vue';

  interface Product {
    id: string;
    name: string;
    price: number;
    image: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  const products = ref<Product[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL as string;

  onMounted(async () => {
      try {
          const response = await axios.get<Product[]>(`${apiUrl}/product?frontend=true`);
          products.value = response.data.filter(product => product.is_active === true);
        } catch (error) {
          console.error('Error fetching products:', error);
      }
  });
</script>