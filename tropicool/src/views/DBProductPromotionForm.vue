<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter une promotion de produit</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer la promotion de produit</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer la promotion de produit</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
          <select id="product_id" v-model="productPromotion.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="start_at" class="block text-sm font-medium text-gray-700">Début de la promotion</label>
          <input type="datetime-local" id="start_at" v-model="productPromotion.start_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="end_at" class="block text-sm font-medium text-gray-700">Fin de la promotion</label>
          <input type="datetime-local" id="end_at" v-model="productPromotion.end_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette promotion de produit ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteProductPromotion" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import dayjs from 'dayjs';

interface ProductPromotion {
  id?: string;
  product_id: string;
  start_at: string;
  end_at: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const productPromotion = ref<ProductPromotion>({
  product_id: '',
  start_at: '',
  end_at: '',
});
const products = ref<Product[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<ProductPromotion>(`${apiUrl}/product_promotion/${route.params.id}`);
      const { product, start_at, end_at, ...rest } = response.data; // Exclude product from data
      productPromotion.value = {
        ...rest,
        start_at: dayjs(start_at).format('YYYY-MM-DDTHH:mm'),
        end_at: dayjs(end_at).format('YYYY-MM-DDTHH:mm'),
      };
    } catch (error) {
      console.error('Error fetching product promotion:', error);
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
    const url = mode.value === 'new' ? `${apiUrl}/product_promotion/new` : `${apiUrl}/product_promotion/${route.params.id}`;

    const { id, product, ...payload } = productPromotion.value; // Exclude product from data

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    console.log('Response:', response); // Log the response

    if (![200, 201].includes(response.status)) {
      throw new Error('Error saving product promotion');
    }

    window.dispatchEvent(new CustomEvent(`product-promotion-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBProductPromotionIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving product promotion:', error);
  }
};

const deleteProductPromotion = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/product_promotion/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('product-promotion-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBProductPromotionIndex' });
      }, 100);
    } else {
      console.error('Failed to delete product promotion');
    }
  } catch (error) {
    console.error('Error deleting product promotion:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBProductPromotionIndex' });
};
</script>
