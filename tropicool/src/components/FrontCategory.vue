<template>
    <div class="max-w-5xl w-full py-4">
      <h1 class="text-4xl font-bold mb-8 text-black">Toutes les catégories</h1>
      <section id="categories">
        <template v-if="categories.length > 0">
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-row gap-8 flex-wrap py-4">
          <Cards 
            v-for="category in categories" 
            :key="category.id" 
            :name="category.name" 
            :imgUrl="category.imgUrl || '../uploads/temporary-image.jpg'"
            :url="category.url" 
            path="FrontCategoryDetails"
          />
        </ul>
        </template>
        <template v-else>
            <p class="text-center text-gray-500 w-full">Pas de catégorie trouvée</p>
          </template>
      </section>
    </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import Cards from '../components/CardsComponent.vue';

  interface Category {
    id: number;
    name: string;
    url: string;
    description: string;
    image: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  const categories = ref<Category[]>([]);
  const apiUrl = import.meta.env.VITE_API_URL as string;

  onMounted(async () => {
      try {
          const response = await axios.get<Category[]>(`${apiUrl}/category?frontend=true`);
          categories.value = response.data;
      } catch (error) {
          console.error('Error fetching categories:', error);
      }
  });
</script>