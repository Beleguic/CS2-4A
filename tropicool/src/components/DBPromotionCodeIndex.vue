<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des codes promotionnels</h1>
        <router-link :to="{ name: 'DBPromotionCodeNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBPromotionCodeEdit" deleteLink="DBPromotionCodeDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de code promotionnel trouvé</p>
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

interface PromotionCode {
  id: string;
  reduction: string;
  code: string;
  start_at: string;
  end_at: string;
}

const datas = ref<PromotionCode[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'code', label: 'Code' },
  { key: 'reduction', label: 'Code %' },
  { key: 'start_at', label: 'Début' },
  { key: 'end_at', label: 'Fin' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchPromotionCodes = async () => {
  try {
    const response = await axios.get<PromotionCode[]>(`${apiUrl}/promotion_code/`);
    datas.value = response.data.map(promo => ({
      ...promo,
      start_at: dayjs(promo.start_at).tz("Europe/Paris").format('DD/MM/YYYY HH:mm'),
      end_at: dayjs(promo.end_at).tz("Europe/Paris").format('DD/MM/YYYY HH:mm'),
    }));
  } catch (error) {
    console.error('Error fetching promotion codes:', error);
  }
};

onMounted(() => {
  fetchPromotionCodes();

  const handlePromotionCodeUpdated = () => fetchPromotionCodes();
  const handlePromotionCodeAdded = () => fetchPromotionCodes();
  const handlePromotionCodeDeleted = () => fetchPromotionCodes();

  window.addEventListener('promotion-code-updated', handlePromotionCodeUpdated);
  window.addEventListener('promotion-code-added', handlePromotionCodeAdded);
  window.addEventListener('promotion-code-deleted', handlePromotionCodeDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('promotion-code-updated', handlePromotionCodeUpdated);
    window.removeEventListener('promotion-code-added', handlePromotionCodeAdded);
    window.removeEventListener('promotion-code-deleted', handlePromotionCodeDeleted);
  });
});
</script>
