<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des promotions de produit</h1>
        <router-link :to="{ name: 'DBProductPromotionNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBProductPromotionEdit" deleteLink="DBProductPromotionDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de promotion de produit trouvée</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

dayjs.extend(utc);
dayjs.extend(timezone);

interface ProductPromotion {
  id: string;
  product: {
    id: string;
    name: string;
  };
  start_at: string;
  end_at: string;
}

const datas = ref<ProductPromotion[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'product_name', label: 'Produit' },
  { key: 'start_at', label: 'Début de la promotion' },
  { key: 'end_at', label: 'Fin de la promotion' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchProductPromotions = async () => {
  try {
    const response = await axios.get<ProductPromotion[]>(`${apiUrl}/product_promotion/`);
    console.log('Fetched Product Promotions:', response.data);

    // Flatten the data and format the dates
    datas.value = response.data.map(promotion => ({
      id: promotion.id,
      product_name: promotion.product.name,
      start_at: dayjs(promotion.start_at).tz("Europe/Paris").format('DD/MM/YYYY HH:mm'), 
      end_at: dayjs(promotion.end_at).tz("Europe/Paris").format('DD/MM/YYYY HH:mm'), 
    }));

    console.log('Final Mapped Product Promotions:', datas.value);
  } catch (error) {
    console.error('Error fetching product promotions:', error);
  }
};

onMounted(() => {
  fetchProductPromotions();

  const handleProductPromotionUpdated = () => fetchProductPromotions();
  const handleProductPromotionAdded = () => fetchProductPromotions();
  const handleProductPromotionDeleted = () => fetchProductPromotions();

  window.addEventListener('product-promotion-updated', handleProductPromotionUpdated);
  window.addEventListener('product-promotion-added', handleProductPromotionAdded);
  window.addEventListener('product-promotion-deleted', handleProductPromotionDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('product-promotion-updated', handleProductPromotionUpdated);
    window.removeEventListener('product-promotion-added', handleProductPromotionAdded);
    window.removeEventListener('product-promotion-deleted', handleProductPromotionDeleted);
  });
});
</script>
