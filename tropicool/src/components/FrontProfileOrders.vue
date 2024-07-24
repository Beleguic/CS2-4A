<template>
  <section class="w-full p-4 bg-gray-100 shadow-xl grid gap-8">
    <h1 class="font-bold text-xl">Mes Commandes</h1>
    <div v-if="userOrders.length > 0" class="grid gap-4">
      <div v-for="order in userOrders" :key="order.id" class="grid gap-2 p-4 bg-white rounded-sm shadow-md">
        <p><strong>Date de commande:</strong> {{ order.created_at }}</p>
        <p><strong>Total:</strong> {{ order.total }} €</p>
        <p><strong>Livraison:</strong> {{ order.livraison }}</p>
        <p><strong>Payé:</strong> {{ order.isPayed }}</p>
        <router-link :to="{ name: 'Confirmation', query: { id_order: order.id } }" class="bg-main hover:bg-secondary block w-full p-3 text-white border-none mt-4 text-center no-underline">Voir les détails</router-link>
      </div>
    </div>
    <div v-else>
      <p>Aucune commande trouvée.</p>
    </div>
  </section>
</template>

<script setup lang="ts">
  interface UserOrder {
    id: number;
    created_at: string;
    total: number;
    livraison: string;
    isPayed: boolean;
  }

  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/authStore';
  import { useToast } from 'vue-toast-notification';

  const $toast = useToast();
  const authStore = useAuthStore();
  const userId = authStore.userId;
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;
  
  const userOrders = ref<UserOrder[]>([]);

  const fetchUserOrders = async () => {
    try {
      const response = await fetch(`${apiUrl}/order?userId=${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
        return;
      }
      const data = await response.json();
      userOrders.value = data.map((order: UserOrder) => ({
        ...order,
        created_at: new Date(order.created_at).toLocaleString('fr-FR'),
        isPayed: order.isPayed ? 'Oui' : 'Non'
      }));
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  };

  onMounted(() => {
    if (authStore.isLoggedIn) {
      fetchUserOrders();
    } else {
      const router = useRouter();
      router.push({ name: 'Login' });
    }
  });
</script>