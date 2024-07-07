<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'un utilisateur</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de l'utilisateur</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de l'utilisateur</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="username" class="block text-sm font-medium text-gray-700">Nom d'utilisateur</label>
          <input type="text" id="username" v-model="user.username" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
          <input type="email" id="email" v-model="user.email" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="dateOfBirth" class="block text-sm font-medium text-gray-700">Date de naissance</label>
          <input type="date" id="dateOfBirth" v-model="user.dateOfBirth" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="firstName" class="block text-sm font-medium text-gray-700">Prénom</label>
          <input type="text" id="firstName" v-model="user.firstName" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="lastName" class="block text-sm font-medium text-gray-700">Nom</label>
          <input type="text" id="lastName" v-model="user.lastName" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
          <input type="password" id="password" v-model="user.password" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="role" class="block text-sm font-medium text-gray-700">Rôle</label>
          <input type="text" id="role" v-model="user.role" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="is_verified" class="block text-sm font-medium text-gray-700">Vérifié</label>
          <input type="checkbox" id="is_verified" v-model="user.is_verified" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cet utilisateur ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteUser" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
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

interface User {
  id?: string;
  email: string;
  dateOfBirth: string;
  password: string;
  role: string;
  is_verified: boolean;
  username: string;
  firstName: string;
  lastName: string;
}

const route = useRoute();
const router = useRouter();
const user = ref<User>({
  email: '',
  dateOfBirth: '',
  password: '',
  role: 'user',
  is_verified: false,
  username: '',
  firstName: '',
  lastName: ''
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get<User>(`${apiUrl}/users/${route.params.id}`);
      const userData = response.data;
      userData.dateOfBirth = dayjs(userData.dateOfBirth).format('YYYY-MM-DD');
      user.value = userData;
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  }
});

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/users/new` : `${apiUrl}/users/${route.params.id}`;

    // Create a payload without sensitive and automatically managed fields
    const { id, created_at, updated_at, verification_token, reset_password_token, reset_password_expires, login_attempts, lock_until, password_last_changed, ...payload } = user.value;

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`user-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBUserIndex' }); // Utilisation du bon nom de route
      }, 100);
    } else {
      throw new Error('Error saving user');
    }
  } catch (error) {
    console.error('Error saving user:', error);
  }
};

const deleteUser = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/users/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('user-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBUserIndex' }); // Utilisation du bon nom de route
      }, 100);
    } else {
      console.error('Failed to delete user');
    }
  } catch (error) {
    console.error('Error deleting user:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBUserIndex' });
};
</script>
