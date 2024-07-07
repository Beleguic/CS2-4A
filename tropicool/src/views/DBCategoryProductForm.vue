<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'un produit à une catégorie</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition du produit de la catégorie</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression du produit de la catégorie</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="category_id" class="block text-sm font-medium text-gray-700">Catégorie</label>
          <select id="category_id" v-model="categoryProduct.category_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
          <select id="product_id" v-model="categoryProduct.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce produit de la catégorie ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteCategoryProduct" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface CategoryProduct {
  id?: string;
  category_id: string;
  product_id: string;
}

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const categoryProduct = ref<CategoryProduct>({
  category_id: '',
  product_id: '',
});
const categories = ref<Category[]>([]);
const products = ref<Product[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<CategoryProduct>(`${apiUrl}/category_product/${route.params.id}`);
      const { category, product, ...rest } = response.data; // Exclude category and product from the data
      categoryProduct.value = rest;
    } catch (error) {
      console.error('Error fetching category product:', error);
    }
  }
  try {
    const categoryResponse = await axios.get<Category[]>(`${apiUrl}/category`);
    const productResponse = await axios.get<Product[]>(`${apiUrl}/product`);
    categories.value = categoryResponse.data;
    products.value = productResponse.data;
  } catch (error) {
    console.error('Error fetching categories or products:', error);
  }
});

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/category_product/new` : `${apiUrl}/category_product/${route.params.id}`;

    const { id, category, product, ...payload } = categoryProduct.value; // Exclude category and product from the data

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`category-product-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBCategoryProductIndex' });
      }, 100);
    } else {
      throw new Error('Error saving category product');
    }
  } catch (error) {
    console.error('Error saving category product:', error);
  }
};

const deleteCategoryProduct = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/category_product/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('category-product-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBCategoryProductIndex' });
      }, 100);
    } else {
      console.error('Failed to delete category product');
    }
  } catch (error) {
    console.error('Error deleting category product:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBCategoryProductIndex' });
};
</script>
