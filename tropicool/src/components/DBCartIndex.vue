<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Tous les paniers</h1>
        <router-link :to="{ name: 'DBCartNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBCartEdit" deleteLink="DBCartDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de panier trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface Cart {
  id: string;
  user: { id: string; username: string };
  cartProductsData: Array<{ product_id: string; name: string; quantity: number }>;
  created_at: string;
  expire_at: string;
  products: string;
}

const datas = ref<Cart[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Utilisateur' },
  { key: 'products', label: 'Produits' },
  { key: 'created_at', label: 'Créé le' },
  { key: 'expire_at', label: 'Expire le' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchCarts = async () => {
  try {
    const response = await axios.get<Cart[]>(`${apiUrl}/cart/`);
    datas.value = response.data.map(cart => {
      return {
        ...cart,
        username: cart.user ? cart.user.username : 'Unknown',
        products: cart.cartProductsData.map(product => `${product.name} (x${product.quantity})`).join(', '),
        created_at: dayjs(cart.created_at).format('DD/MM/YYYY HH:mm'),
        expire_at: dayjs(cart.expire_at).format('DD/MM/YYYY HH:mm')
      };
    });
  } catch (error) {
    console.error('Error fetching carts:', error);
  }
};

onMounted(() => {
  fetchCarts();

  const handleCartUpdated = () => fetchCarts();
  const handleCartAdded = () => fetchCarts();
  const handleCartDeleted = () => fetchCarts();

  window.addEventListener('cart-updated', handleCartUpdated);
  window.addEventListener('cart-added', handleCartAdded);
  window.addEventListener('cart-deleted', handleCartDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('cart-updated', handleCartUpdated);
    window.removeEventListener('cart-added', handleCartAdded);
    window.removeEventListener('cart-deleted', handleCartDeleted);
  });
});
</script>
