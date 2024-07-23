<template>
  <div class="p-4">
    <template v-if="category">
      <div class="max-w-[80%] mx-auto mt-8 grid gap-16">
        <div id="category-description" class="grid grid-cols-2 gap-4 items-center">
          <div class="flex items-center justify-center">
            <img :src="category.image" alt="category image"/>
          </div>
          <div class="flex flex-col gap-4">
            <h1 class="text-main text-4xl font-bold">{{ category.name }}</h1>
            <p class="text-black text-xl">{{ category.description }}</p>
          </div>
        </div>
        <div v-if="category.products && category.products.length > 0" class="grid gap-4">
          <h2 class="text-main text-2xl font-bold">Produits Associés</h2>
          <ul ref="productsList" class="snap-x flex items-center gap-4 overflow-x-auto" :style="{ maxWidth: `${maxWidth}px` }">
            <ProductCardComponent v-for="product in category.products" :key="product.id" :product="product" class="snap-center h-full min-w-96 max-w-[33.33%]"/>
          </ul>
        </div>
        <div v-else>
          <h2 class="text-main text-2xl font-bold">Pas de produits Associés...</h2>
        </div>
      </div>
    </template>
    <template v-else>
      <p>Pas de catégorie trouvée...</p>
    </template>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import ProductCardComponent from '../components/ProductCardComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();

interface Product {
  id: string;
  name: string;
}

interface Category {
  name: string;
  description: string;
  url: string;
  image: string;
  products: Product[];
}

const route = useRoute();
const category = ref<Category | null>(null);
const apiUrl = import.meta.env.VITE_API_URL as string;
const maxWidth = ref<number>(0);
const productsList = ref<HTMLUListElement | null>(null);

const updateMaxWidth = () => {
  const categoryDescription = document.getElementById('category-description');
  if (categoryDescription) {
    maxWidth.value = categoryDescription.clientWidth;
  }
};

onMounted(async () => {
  try {
    const params = new URLSearchParams({
      frontend: 'true',
      url: route.params.id as string,
    });

    const response = await fetch(`${apiUrl}/category?${params.toString()}`, {
      method: 'GET',
    });

    console.log('response :', response);

    if (!response.ok) {
      $toast.open({
        message: 'Erreur, veuillez recommencer',
        type: 'error',
        position: 'bottom-left',
      });
    }

    const data = await response.json();
    if (Array.isArray(data) && data.length > 0) {
      category.value = data[0] as Category;
      await nextTick();  // Ensure the DOM is updated
      updateMaxWidth();
    } else {
      category.value = null;
    }
  } catch (error) {
    $toast.open({
      message: 'Erreur, veuillez recommencer',
      type: 'error',
      position: 'bottom-left',
    });
  }
});

window.addEventListener('resize', updateMaxWidth);

onUnmounted(() => {
  window.removeEventListener('resize', updateMaxWidth);
});
</script>

<style scoped>
  .-ml-3\/12 {
    margin-left: -25%;
  }
</style>