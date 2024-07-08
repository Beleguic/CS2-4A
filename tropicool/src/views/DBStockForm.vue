<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un stock</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer le stock</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer le stock</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
          <select id="product_id" v-model="stock.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantité</label>
          <input type="number" id="quantity" v-model="stock.quantity" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required min="0" />
        </div>
        <div class="grid gap-1">
          <label for="status" class="block text-sm font-medium text-gray-700">Status</label>
          <select id="status" v-model="stock.status" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option value="add">Ajout</option>
            <option value="remove">Suppression</option>
          </select>
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce stock ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteStock" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface Stock {
  id?: string;
  product_id: string;
  quantity: number;
  status: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const stock = ref<Stock>({
  product_id: '',
  quantity: 0,
  status: 'add',
});
const products = ref<Product[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<Stock>(`${apiUrl}/stock/${route.params.id}`);
      const { product, created_at, ...rest } = response.data;  // Exclure product et created_at des données
      stock.value = rest;
    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  }
  try {
    const productResponse = await axios.get<Product[]>(`${apiUrl}/product`);
    products.value = productResponse.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/stock/new` : `${apiUrl}/stock/${route.params.id}`;

    const { id, product, created_at, ...payload } = stock.value;  // Exclure product et created_at des données

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`stock-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBStockIndex' });
      }, 100);
    } else {
      throw new Error('Error saving stock');
    }
  } catch (error) {
    console.error('Error saving stock:', error);
  }
};

const deleteStock = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/stock/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('stock-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBStockIndex' });
      }, 100);
    } else {
      console.error('Failed to delete stock');
    }
  } catch (error) {
    console.error('Error deleting stock:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBStockIndex' });
};
</script>
