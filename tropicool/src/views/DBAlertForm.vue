<template>
        <section class="h-full">
          <div class="py-8 px-6">
            <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'une alerte</h1>
            <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de l'alerte</h1>
            <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de l'alerte</h1>
      
            <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
              <div class="grid gap-1">
                <label for="alert_type_id" class="block text-sm font-medium text-gray-700">Type d'alerte</label>
                <input type="number" id="alert_type_id" v-model="alert.alert_type_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div class="grid gap-1">
                <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
                <select id="product_id" v-model="alert.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm">
                  <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
                </select>
              </div>
              <div class="grid gap-1">
                <label for="category_id" class="block text-sm font-medium text-gray-700">Catégorie</label>
                <select id="category_id" v-model="alert.category_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm">
                  <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
                </select>
              </div>
              <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
            </form>
      
            <div v-if="mode === 'delete'" class="grid gap-4">
              <p>Êtes-vous sûr de vouloir supprimer cette alerte ?</p>
              <div class="flex gap-4">
                <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
                <button @click="deleteAlert" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
              </div>
            </div>
          </div>
        </section>
      </template>
      
      <script setup lang="ts">
      import { ref, onMounted } from 'vue';
      import { useRoute, useRouter } from 'vue-router';
      
      interface Alert {
        id?: string;
        alert_type_id: number;
        product_id?: string;
        category_id?: string;
        created_at?: string;
      }
      
      interface Product {
        id: string;
        name: string;
      }
      
      interface Category {
        id: string;
        name: string;
      }
      
      const route = useRoute();
      const router = useRouter();
      const alert = ref<Alert>({
        alert_type_id: 0,
        product_id: null,
        category_id: null,
      });
      const products = ref<Product[]>([]);
      const categories = ref<Category[]>([]);
      const apiUrl = import.meta.env.VITE_API_URL as string;
      const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');
      
      const fetchProducts = async () => {
        try {
          const response = await fetch(`${apiUrl}/product/list`);
          if (response.ok) {
            products.value = await response.json();
          } else {
            console.error('Error fetching products');
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      };
      
      const fetchCategories = async () => {
        try {
          const response = await fetch(`${apiUrl}/category/list`);
          if (response.ok) {
            categories.value = await response.json();
          } else {
            console.error('Error fetching categories');
          }
        } catch (error) {
          console.error('Error fetching categories:', error);
        }
      };
      
      onMounted(async () => {
        await fetchProducts();
        await fetchCategories();
      
        if (mode.value === 'edit' || mode.value === 'delete') {
          try {
            const response = await fetch(`${apiUrl}/alert/${route.params.id}`);
            if (!response.ok) {
              throw new Error('Error fetching alert');
            }
            alert.value = await response.json();
          } catch (error) {
            console.error('Error fetching alert:', error);
          }
        }
      });
      
const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/alert/new` : `${apiUrl}/alert/${route.params.id}`;

    const { id, product, category, created_at, ...payload } = alert.value;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error saving alert');
    }
    window.dispatchEvent(new CustomEvent(`alert-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBAlertIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving alert:', error);
  }
};

      
      const deleteAlert = async () => {
        try {
          const response = await fetch(`${apiUrl}/alert/${route.params.id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            window.dispatchEvent(new CustomEvent('alert-deleted'));
            setTimeout(() => {
              router.push({ name: 'DBAlertIndex' });
            }, 100);
          } else {
            console.error('Failed to delete alert');
          }
        } catch (error) {
          console.error('Error deleting alert:', error);
        }
      };
      
      const goBack = () => {
        router.push({ name: 'DBAlertIndex' });
      };
      </script>
      