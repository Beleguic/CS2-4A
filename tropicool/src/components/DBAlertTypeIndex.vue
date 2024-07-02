<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Tous les types d'alerte</h1>
        <router-link :to="{ name: 'DBAlertTypeNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBAlertTypeEdit" deleteLink="DBAlertTypeDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de type d'alerte trouvé</p>
      </template>
    </div>
    <router-view /> <!-- This renders the child routes -->
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import Table from '../components/TableComponent.vue';

interface AlertType {
  id: number;
  type: string;
}

const datas = ref<AlertType[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'type', label: 'Type' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchAlertTypes = async () => {
  try {
    const response = await axios.get<AlertType[]>(`${apiUrl}/alert_types/`);
    datas.value = response.data;
  } catch (error) {
    console.error('Error fetching alert types:', error);
  }
};

onMounted(() => {
  fetchAlertTypes();

  const handleAlertTypeUpdated = () => fetchAlertTypes();
  const handleAlertTypeAdded = () => fetchAlertTypes();
  const handleAlertTypeDeleted = () => fetchAlertTypes();

  window.addEventListener('alert-type-updated', handleAlertTypeUpdated);
  window.addEventListener('alert-type-added', handleAlertTypeAdded);
  window.addEventListener('alert-type-deleted', handleAlertTypeDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('alert-type-updated', handleAlertTypeUpdated);
    window.removeEventListener('alert-type-added', handleAlertTypeAdded);
    window.removeEventListener('alert-type-deleted', handleAlertTypeDeleted);
  });
});
</script>
