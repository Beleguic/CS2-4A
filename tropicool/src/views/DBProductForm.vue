<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un produit</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer le produit</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer le produit</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6" enctype="multipart/form-data">
        <div class="grid gap-1">
          <label for="name" class="block text-sm font-medium text-gray-700">Nom</label>
          <input type="text" id="name" v-model="product.name" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="price" class="block text-sm font-medium text-gray-700">Prix</label>
          <input type="number" step="0.01" id="price" v-model.number="product.price" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required min="0" /> 
        </div>
        <div class="grid gap-1">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <textarea id="description" v-model="product.description" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required></textarea>
        </div>
        <div class="grid gap-1">
          <label for="image" class="block text-sm font-medium text-gray-700">Image</label>
          <input type="file" id="image" @change="handleFileUpload" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="is_active" class="block text-sm font-medium text-gray-700">Actif</label>
          <input type="checkbox" id="is_active" v-model="product.is_active" class="p-2 block border border-gray-300 rounded-md shadow-sm" />
        </div>
        <div class="grid gap-1">
          <label for="is_adult" class="block text-sm font-medium text-gray-700">Produit réservé aux adultes</label>
          <input type="checkbox" id="is_adult" v-model="product.is_adult" class="p-2 block border border-gray-300 rounded-md shadow-sm" />
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce produit ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteProduct" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface Product {
  id?: string;
  name: string;
  price: number;
  description: string;
  image?: File; // Modifier pour gérer les fichiers
  is_active?: boolean;
  is_adult?: boolean;
}

const route = useRoute();
const router = useRouter();
const product = ref<Product>({
  name: '',
  price: 0,
  description: '',
  image: undefined,
  is_active: true,
  is_adult: false,
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<Product>(`${apiUrl}/product/${route.params.id}`);
      product.value = response.data;
    } catch (error) {
      console.error('Error fetching product:', error);
    }
  }
});

const handleFileUpload = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files?.length) {
    product.value.image = target.files[0];
  }
};

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/product/new` : `${apiUrl}/product/${route.params.id}`;

    const formData = new FormData();
    formData.append('name', product.value.name);
    formData.append('price', product.value.price.toString());
    formData.append('description', product.value.description);
    if (product.value.image) {
      formData.append('image', product.value.image);
    }
    formData.append('is_active', product.value.is_active ? 'true' : 'false');
    formData.append('is_adult', product.value.is_adult ? 'true' : 'false');

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      data: formData,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`product-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBProductIndex' });
      }, 100);
    } else {
      throw new Error('Error saving product');
    }
  } catch (error) {
    console.error('Error saving product:', error);
  }
};

const deleteProduct = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/product/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('product-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBProductIndex' });
      }, 100);
    } else {
      console.error('Failed to delete product');
    }
  } catch (error) {
    console.error('Error deleting product:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBProductIndex' });
};
</script>
