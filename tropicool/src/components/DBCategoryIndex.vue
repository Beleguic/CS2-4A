<template>
  <section v-if="isDBCatIndex" class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Toutes les catégories</h1>
        <router-link :to="{ name: 'DBCategoryNew' }"
          class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBCategoryEdit" deleteLink="DBCategoryDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de catégorie trouvée</p>
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

interface Category {
  id: number;
  name: string;
  url: string;
  description: string;
  image: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

const datas = ref<Category[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'name', label: 'Nom' },
  { key: 'is_active', label: 'Status' },
  { key: 'created_at', label: 'Crée le' },
  { key: 'updated_at', label: 'Modifié le' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchCategories = async () => {
  try {
    const response = await axios.get<Category[]>(`${apiUrl}/category/`);
    console.log('Fetched Categories:', response.data);

    // Map data to format dates
    datas.value = response.data.map(category => ({
      ...category,
      created_at: dayjs(category.created_at).format('DD/MM/YYYY HH:mm'), // Format the createdAt date
      updated_at: dayjs(category.updated_at).format('DD/MM/YYYY HH:mm')  // Format the updatedAt date
    }));

    console.log('datasss', datas);

    console.log('Mapped Categories:', datas.value);
  } catch (error) {
    console.error('Error fetching datas:', error);
  }
};

onMounted(() => {
  fetchCategories();

  const handleCategoryUpdated = () => fetchCategories();
  const handleCategoryAdded = () => fetchCategories();
  const handleCategoryDeleted = () => fetchCategories();

  window.addEventListener('category-updated', handleCategoryUpdated);
  window.addEventListener('category-added', handleCategoryAdded);
  window.addEventListener('category-deleted', handleCategoryDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('category-updated', handleCategoryUpdated);
    window.removeEventListener('category-added', handleCategoryAdded);
    window.removeEventListener('category-deleted', handleCategoryDeleted);
  });
});

const route = useRoute();
const isDBCatIndex = computed(() => route.path.endsWith('/category'));
</script>
