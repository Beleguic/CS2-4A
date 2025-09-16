<template>
    <div class="px-4">
      <h1 class="text-4xl font-bold mb-8 text-black">Toutes les catégories</h1>
      <section id="categories">
        <LoadingSpinner v-if="loading" :loading="true" />
        <template v-else-if="categories.length > 0">
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-row gap-8 flex-wrap py-4">
          <Cards 
            v-for="category in categories" 
            :key="category.id" 
            :name="category.name || ''" 
            :image="category.image || '../uploads/temporary-image.jpg'"
            :url="category.url || category.id?.toString() || ''" 
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
  import LoadingSpinner from '../components/LoadingSpinner.vue';
  import { useToast } from 'vue-toast-notification';

  const $toast = useToast();

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
  const loading = ref(true);
  const apiUrl = import.meta.env.VITE_API_URL as string;

  onMounted(async () => {
      try {
          const response = await axios.get<Category[]>(`${apiUrl}/category?frontend=true`);
          categories.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des catégories:', error);
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        }); 
      } finally {
        loading.value = false;
      }
  });
</script>