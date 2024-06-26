<template>
  <section v-if="isDBCatIndex" class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Toutes les catégories</h1>
        <router-link :to="{ name: 'DBCategoryNew' }"
          class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <Table :columns="columns" :datas="datas" EditLink="DBCategoryEdit" DeleteLink="DBCategoryDelete" />
    </div>
  </section>
  <router-view v-else></router-view>
</template>

<script setup lang="ts">
  import { useRoute } from 'vue-router';
  import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
  import axios from 'axios';
  import Table from '../components/TableComponent.vue';

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

  const datas = ref<Category[]>([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'is_active', label: 'Status' },
    { key: 'createdAt', label: 'Crée le' },
    { key: 'updatedAt', label: 'Modifié le' },
    { key: 'actions', label: 'Actions' },
  ];

  const apiUrl = import.meta.env.VITE_API_URL as string;

  const fetchCategories = async () => {
    try {
      const response = await axios.get<Category[]>(`${apiUrl}/category/`);
      datas.value = response.data;
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
