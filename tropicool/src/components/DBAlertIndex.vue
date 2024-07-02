<template>
  <section v-if="isDBAlertIndex" class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Toutes les alertes</h1>
        <router-link :to="{ name: 'DBAlertNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBAlertEdit" deleteLink="DBAlertDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas d'alerte trouvée</p>
      </template>
    </div>
  </section>
  <router-view v-else></router-view>
</template>

<script setup lang="ts">
import { useRoute } from 'vue-router';
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface Alert {
  id: string;
  alert_type_id: number;
  product_id?: string;
  category_id?: string;
  created_at: string;
}

const datas = ref<Alert[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'alert_type_id', label: 'Type' },
  { key: 'product_id', label: 'Produit' },
  { key: 'category_id', label: 'Catégorie' },
  { key: 'created_at', label: 'Crée le' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchAlerts = async () => {
  try {
    const response = await axios.get<Alert[]>(`${apiUrl}/alert/`);
    console.log('Fetched Alerts:', response.data);

    // Map data to format dates
    datas.value = response.data.map(alert => ({
      ...alert,
      created_at: dayjs(alert.created_at).format('DD/MM/YYYY HH:mm') // Format the created_at date
    }));

    console.log('Mapped Alerts:', datas.value);
  } catch (error) {
    console.error('Error fetching datas:', error);
  }
};

onMounted(() => {
  fetchAlerts();

  const handleAlertUpdated = () => fetchAlerts();
  const handleAlertAdded = () => fetchAlerts();
  const handleAlertDeleted = () => fetchAlerts();

  window.addEventListener('alert-updated', handleAlertUpdated);
  window.addEventListener('alert-added', handleAlertAdded);
  window.addEventListener('alert-deleted', handleAlertDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('alert-updated', handleAlertUpdated);
    window.removeEventListener('alert-added', handleAlertAdded);
    window.removeEventListener('alert-deleted', handleAlertDeleted);
  });
});

const route = useRoute();
const isDBAlertIndex = computed(() => route.path.endsWith('/alert'));
</script>
