<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des abonnés à la newsletter</h1>
        <router-link :to="{ name: 'DBNewsletterNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBNewsletterEdit" deleteLink="DBNewsletterDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas d'abonné trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface User {
  id: string;
  username: string;
  email: string;
}

interface Newsletter {
  id: string;
  user_id: string;
  user: User;
  created_at: string;
}

const datas = ref<Newsletter[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'username', label: 'Utilisateur' },
  { key: 'email', label: 'Email' },
  { key: 'created_at', label: 'Date d\'abonnement' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchNewsletters = async () => {
  try {
    const response = await axios.get<Newsletter[]>(`${apiUrl}/newsletter/`);
    // Assurez-vous que les données sont correctement mappées
    const newslettersWithUsers = response.data.map(newsletter => {
      return {
        ...newsletter,
        username: newsletter.user.username,
        email: newsletter.user.email,
        created_at: dayjs(newsletter.created_at).format('DD/MM/YYYY HH:mm')  // Format the created_at date
      };
    });
    console.log('Mapped newsletters:', newslettersWithUsers);  // Ajoutez cette ligne pour vérifier les données
    datas.value = newslettersWithUsers;
  } catch (error) {
    console.error('Error fetching newsletters:', error);
  }
};

onMounted(() => {
  fetchNewsletters();

  const handleNewsletterUpdated = () => fetchNewsletters();
  const handleNewsletterAdded = () => fetchNewsletters();
  const handleNewsletterDeleted = () => fetchNewsletters();

  window.addEventListener('newsletter-updated', handleNewsletterUpdated);
  window.addEventListener('newsletter-added', handleNewsletterAdded);
  window.addEventListener('newsletter-deleted', handleNewsletterDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('newsletter-updated', handleNewsletterUpdated);
    window.removeEventListener('newsletter-added', handleNewsletterAdded);
    window.removeEventListener('newsletter-deleted', handleNewsletterDeleted);
  });
});
</script>
