<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout à la newsletter</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de la newsletter</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de la newsletter</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="user_id" class="block text-sm font-medium text-gray-700">Utilisateur</label>
          <select id="user_id" v-model="newsletter.user_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }} - {{ user.email }}</option>
          </select>
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette entrée de la newsletter ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteNewsletter" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface Newsletter {
  id?: string;
  user_id: string;
}

interface User {
  id: string;
  username: string;
  email: string;
}

const route = useRoute();
const router = useRouter();
const newsletter = ref<Newsletter>({ user_id: '' });
const users = ref<User[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await axios.get(`${apiUrl}/newsletter/${route.params.id}`);
      newsletter.value = response.data;
    } catch (error) {
      console.error('Error fetching newsletter:', error);
    }
  }
  try {
    const userResponse = await axios.get(`${apiUrl}/users`);
    users.value = userResponse.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
});

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/newsletter/new` : `${apiUrl}/newsletter/${route.params.id}`;

    const { id, ...payload } = newsletter.value;

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      window.dispatchEvent(new CustomEvent(`newsletter-${mode.value === 'new' ? 'added' : 'updated'}`));
      setTimeout(() => {
        router.push({ name: 'DBNewsletterIndex' });
      }, 100);
    } else {
      throw new Error('Error saving newsletter');
    }
  } catch (error) {
    console.error('Error saving newsletter:', error);
  }
};

const deleteNewsletter = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/newsletter/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('newsletter-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBNewsletterIndex' });
      }, 100);
    } else {
      console.error('Failed to delete newsletter');
    }
  } catch (error) {
    console.error('Error deleting newsletter:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBNewsletterIndex' });
};
</script>
