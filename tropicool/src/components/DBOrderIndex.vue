<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des commandes</h1>
        <router-link :to="{ name: 'DBOrderNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBOrderEdit" deleteLink="DBOrderDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas de commandes trouvées</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface Order {
  id: string;
  user: {
    id: string;
    username: string;
    email: string;
  };
  products: string;
  created_at: string;
}

const datas = ref<Order[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Utilisateur' },
  { key: 'products', label: 'Produits' },
  { key: 'created_at', label: 'Date de commande' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchOrders = async () => {
  try {
    const response = await axios.get<Order[]>(`${apiUrl}/order/`);
    // Assurez-vous que les données sont correctement mappées
    const ordersWithUsers = response.data.map(order => {
      return {
        ...order,
        username: order.User.username,
        email: order.User.email,
        products: JSON.stringify(order.products),  // Serialize products array to string
        created_at: dayjs(order.created_at).format('DD/MM/YYYY HH:mm')  // Format the created_at date
      };
    });
    console.log('Mapped orders:', ordersWithUsers);  // Ajoutez cette ligne pour vérifier les données
    datas.value = ordersWithUsers;
  } catch (error) {
    console.error('Error fetching orders:', error);
  }
};

onMounted(() => {
  fetchOrders();

  const handleOrderUpdated = () => fetchOrders();
  const handleOrderAdded = () => fetchOrders();
  const handleOrderDeleted = () => fetchOrders();

  window.addEventListener('order-updated', handleOrderUpdated);
  window.addEventListener('order-added', handleOrderAdded);
  window.addEventListener('order-deleted', handleOrderDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('order-updated', handleOrderUpdated);
    window.removeEventListener('order-added', handleOrderAdded);
    window.removeEventListener('order-deleted', handleOrderDeleted);
  });
});
</script>
