<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <div class="flex items-center justify-between mb-8">
        <h1 class="text-4xl font-bold text-black">Liste des utilisateurs</h1>
        <router-link :to="{ name: 'DBUserNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
      </div>
      <template v-if="datas.length > 0">
        <Table :columns="columns" :datas="datas" editLink="DBUserEdit" deleteLink="DBUserDelete" />
      </template>
      <template v-else>
        <p class="text-center text-gray-500">Pas d'utilisateur trouvé</p>
      </template>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';

interface User {
  id: string;
  email: string;
  username: string;
  firstName: string;
  lastName: string;
  role: string;
  is_verified: boolean;
  login_attempts: number;
  dateOfBirth: string;
  created_at: string;
  updated_at: string;
}

const datas = ref<User[]>([]);

const columns = [
  { key: 'id', label: 'ID' },
  { key: 'email', label: 'Email' },
  { key: 'username', label: 'Login' },
  { key: 'firstName', label: 'Prénom' },
  { key: 'lastName', label: 'Nom' },
  { key: 'role', label: 'Rôle' },
  { key: 'is_verified', label: 'Vérifié' },
  { key: 'login_attempts', label: 'Tentatives de connexion' },
  { key: 'dateOfBirth', label: 'Date de naissance' },
  { key: 'created_at', label: 'Créé le' },
  { key: 'updated_at', label: 'Mis à jour le' },
  { key: 'actions', label: 'Actions' },
];

const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchUsers = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      throw new Error('No token found in localStorage');
    }

    const response = await fetch(`${apiUrl}/users/`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch users');
    }

    const data: User[] = await response.json();
    console.log('Fetched Users:', data);

    // Flatten the data and format the dates
    datas.value = data.map(user => ({
      ...user,
      dateOfBirth: dayjs(user.dateOfBirth).format('DD/MM/YYYY'),
      created_at: dayjs(user.created_at).format('DD/MM/YYYY HH:mm'),
      updated_at: dayjs(user.updated_at).format('DD/MM/YYYY HH:mm')
    }));

    console.log('Final Mapped Users:', datas.value);
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

onMounted(() => {
  fetchUsers();

  const handleUserUpdated = () => fetchUsers();
  const handleUserAdded = () => fetchUsers();
  const handleUserDeleted = () => fetchUsers();

  window.addEventListener('user-updated', handleUserUpdated);
  window.addEventListener('user-added', handleUserAdded);
  window.addEventListener('user-deleted', handleUserDeleted);

  onBeforeUnmount(() => {
    window.removeEventListener('user-updated', handleUserUpdated);
    window.removeEventListener('user-added', handleUserAdded);
    window.removeEventListener('user-deleted', handleUserDeleted);
  });
});
</script>
