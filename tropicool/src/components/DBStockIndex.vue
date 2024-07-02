<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des stocks</h1>
        <router-link :to="{ name: 'DBStockNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBStockEdit" deleteLink="DBStockDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de stock trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface Stock {
  id: string;
  product: {
    id: string;
    name: string;
  };
  quantity: number;
  created_at: string;
}

const datas = ref<Stock[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'productName', label: 'Produit' }, // Use a flattened key
  { key: 'quantity', label: 'Quantité' },
  { key: 'created_at', label: 'Date d\'ajout' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchStocks = async () => {
  try {
    const response = await axios.get<Stock[]>(`${apiUrl}/stock/`);
    console.log('Fetched Stocks:', response.data); // Log the response data to verify structure

    // Map data to include productName at the top level and format the date
    datas.value = response.data.map(stock => ({
      ...stock,
      productName: stock.product.name, // Add product name to top level
      created_at: dayjs(stock.created_at).format('DD/MM/YYYY HH:mm') // Format the date
    }));

    console.log('Mapped Stocks:', datas.value); // Log the mapped data
  } catch (error) {
    console.error('Error fetching stocks:', error);
  }
};

onMounted(() => {
  fetchStocks();

  const handleStockUpdated = () => fetchStocks();
  const handleStockAdded = () => fetchStocks();
  const handleStockDeleted = () => fetchStocks();

  window.addEventListener('stock-updated', handleStockUpdated);
  window.addEventListener('stock-added', handleStockAdded);
  window.addEventListener('stock-deleted', handleStockDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('stock-updated', handleStockUpdated);
    window.removeEventListener('stock-added', handleStockAdded);
    window.removeEventListener('stock-deleted', handleStockDeleted);
  });
});
</script>
