<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des produits</h1>
        <router-link :to="{ name: 'DBProductNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBProductEdit" deleteLink="DBProductDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de produit trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted, onBeforeUnmount } from 'vue';
  import axios from 'axios';
  import dayjs from 'dayjs';
  import Table from '../components/TableComponent.vue';

  interface Product {
    id: string;
    name: string;
    price: number;
    description: string;
    image: string;
    is_active: boolean;
    is_adult: boolean;
    created_at: string;
    updated_at: string;
  }

  const datas = ref<Product[]>([]);

  const columns = [
    { key: 'id', label: 'ID' },
    { key: 'name', label: 'Nom' },
    { key: 'price', label: 'Prix' },
    { key: 'description', label: 'Description' },
    { key: 'image', label: 'Image' },
    { key: 'is_active', label: 'Actif' },
    { key: 'is_adult', label: 'Adulte' },
    { key: 'created_at', label: 'Créé le' },
    { key: 'updated_at', label: 'Mis à jour le' },
    { key: 'actions', label: 'Actions' },
  ];

  const apiUrl = import.meta.env.VITE_API_URL as string;

  const truncate = (text: string, maxLength: number) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get<Product[]>(`${apiUrl}/product/`);
      datas.value = response.data.map(product => ({
        ...product,
        description: truncate(product.description, 30),
        image: truncate(product.image, 15),  // Truncate image URL
        created_at: dayjs(product.created_at).format('DD/MM/YYYY HH:mm'),
        updated_at: dayjs(product.updated_at).format('DD/MM/YYYY HH:mm'),
      }));
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  onMounted(() => {
    fetchProducts();

    const handleProductUpdated = () => fetchProducts();
    const handleProductAdded = () => fetchProducts();
    const handleProductDeleted = () => fetchProducts();

    window.addEventListener('product-updated', handleProductUpdated);
    window.addEventListener('product-added', handleProductAdded);
    window.addEventListener('product-deleted', handleProductDeleted);

    onBeforeUnmount(() => {
      window.removeEventListener('product-updated', handleProductUpdated);
      window.removeEventListener('product-added', handleProductAdded);
      window.removeEventListener('product-deleted', handleProductDeleted);
    });
  });
</script>

