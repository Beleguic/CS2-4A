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
  alertType: { type: string };
  product: { id: string, name: string } | null;
  category: { id: string, name: string } | null;
  user: { username: string };
  created_at: string;
}

const datas = ref<Alert[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'alertType.type', label: 'Type d\'alerte' },
  { key: 'product.name', label: 'Produit' },
  { key: 'category.name', label: 'Catégorie' },
  { key: 'user.username', label: 'Utilisateur' },
  { key: 'created_at', label: 'Crée le' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchAlerts = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await axios.get<Alert[]>(`${apiUrl}/alerts`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    console.log('Fetched Alerts:', response.data);

    datas.value = response.data.map(alert => ({
      ...alert,
      created_at: dayjs(alert.created_at).format('DD/MM/YYYY HH:mm'),
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
