<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Produits par catégorie</h1>
        <router-link :to="{ name: 'DBCategoryProductNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBCategoryProductEdit" deleteLink="DBCategoryProductDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de produit par catégorie trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import Table from '../components/TableComponent.vue';

interface CategoryProduct {
  id: string;
  category: {
    id: string;
    name: string;
  };
  product: {
    id: string;
    name: string;
  };
}

const datas = ref<CategoryProduct[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'productName', label: 'Produit' }, // Flattened key for product name
  { key: 'categoryName', label: 'Catégorie' }, // Flattened key for category name
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchCategoryProducts = async () => {
  try {
    const response = await axios.get<CategoryProduct[]>(`${apiUrl}/category_product/`);
    console.log('Fetched Category Products:', response.data); // Log the response data to verify structure

    // Map data to include categoryName and productName at the top level
    datas.value = response.data.map(item => ({
      ...item,
      categoryName: item.category.name,
      productName: item.product.name
    }));

    console.log('Mapped Category Products:', datas.value); // Log the mapped data
  } catch (error) {
    console.error('Error fetching category products:', error);
  }
};

onMounted(() => {
  fetchCategoryProducts();

  const handleCategoryProductUpdated = () => fetchCategoryProducts();
  const handleCategoryProductAdded = () => fetchCategoryProducts();
  const handleCategoryProductDeleted = () => fetchCategoryProducts();

  window.addEventListener('category-product-updated', handleCategoryProductUpdated);
  window.addEventListener('category-product-added', handleCategoryProductAdded);
  window.addEventListener('category-product-deleted', handleCategoryProductDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('category-product-updated', handleCategoryProductUpdated);
    window.removeEventListener('category-product-added', handleCategoryProductAdded);
    window.removeEventListener('category-product-deleted', handleCategoryProductDeleted);
  });
});
</script>
