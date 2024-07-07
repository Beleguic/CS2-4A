<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter une commande</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer la commande</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer la commande</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="user_id" class="block text-sm font-medium text-gray-700">Utilisateur</label>
          <select id="user_id" v-model="order.user_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }} - {{ user.email }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
          <select id="product_id" v-model="selectedProduct.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm">
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantité</label>
          <input type="number" id="quantity" v-model="selectedProduct.quantity" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
        </div>
        <button type="button" @click="addProduct" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">Ajouter produit</button>
        <ul>
          <li v-for="(product, index) in order.products" :key="index" class="text-black">
            {{ product.name }} - {{ product.quantity }}
            <button type="button" @click="removeProduct(index)" class="text-red-500 ml-2">Supprimer</button>
          </li>
        </ul>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette commande ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteOrder" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface Order {
  id?: string;
  user_id: string;
  products: Array<{ product_id: string; name: string; quantity: number }>;
}

interface User {
  id: string;
  username: string;
  email: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const order = ref<Order>({
  user_id: '',
  products: [],
});
const users = ref<User[]>([]);
const products = ref<Product[]>([]);
const selectedProduct = ref<{ product_id: string; quantity: number; name?: string }>({
  product_id: '',
  quantity: 1,
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  await fetchUsers();
  await fetchProducts();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/order/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching order');
      }
      const orderData = await response.json();
      // Map product_id to product name for existing order products
      orderData.products.forEach((product: { product_id: string; quantity: number }) => {
        const prod = products.value.find(p => p.id === product.product_id);
        if (prod) {
          order.value.products.push({
            product_id: product.product_id,
            name: prod.name,
            quantity: product.quantity,
          });
        }
      });
      order.value = { ...orderData, products: order.value.products };
    } catch (error) {
      console.error('Error fetching order:', error);
    }
  }
});

const fetchUsers = async () => {
  try {
    const response = await axios.get<User[]>(`${apiUrl}/users`);
    users.value = response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchProducts = async () => {
  try {
    const response = await axios.get<Product[]>(`${apiUrl}/product`);
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const addProduct = () => {
  const product = products.value.find(p => p.id === selectedProduct.value.product_id);
  if (product) {
    order.value.products.push({
      product_id: selectedProduct.value.product_id,
      name: product.name,
      quantity: selectedProduct.value.quantity,
    });
    selectedProduct.value = { product_id: '', quantity: 1 };
  }
};

const removeProduct = (index: number) => {
  order.value.products.splice(index, 1);
};

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/order/new` : `${apiUrl}/order/${route.params.id}`;

    const { id, products, ...payload } = order.value;

    // Extract the product IDs and quantities
    const productsPayload = products.map(product => ({
      product_id: product.product_id,
      quantity: product.quantity,
    }));

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, products: productsPayload }),
    });
    if (!response.ok) {
      throw new Error('Error saving order');
    }
    window.dispatchEvent(new CustomEvent(`order-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBOrderIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving order:', error);
  }
};

const deleteOrder = async () => {
  try {
    const response = await fetch(`${apiUrl}/order/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('order-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBOrderIndex' });
      }, 100);
    } else {
      console.error('Failed to delete order');
    }
  } catch (error) {
    console.error('Error deleting order:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBOrderIndex' });
};
</script>
