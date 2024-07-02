<template>
        <section class="h-full">
          <div class="py-8 px-6">
            <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un historique utilisateur</h1>
            <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer l'historique utilisateur</h1>
            <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer l'historique utilisateur</h1>
      
            <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
              <div class="grid gap-1">
                <label for="email" class="block text-sm font-medium text-gray-700">Email</label>
                <input type="email" id="email" v-model="userHistory.email" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div class="grid gap-1">
                <label for="password" class="block text-sm font-medium text-gray-700">Mot de passe</label>
                <input type="password" id="password" v-model="userHistory.password" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div class="grid gap-1">
                <label for="role" class="block text-sm font-medium text-gray-700">Rôle</label>
                <input type="text" id="role" v-model="userHistory.role" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
              </div>
              <div class="grid gap-1">
                <label for="is_verified" class="block text-sm font-medium text-gray-700">Vérifié</label>
                <input type="checkbox" id="is_verified" v-model="userHistory.is_verified" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div class="grid gap-1">
                <label for="login_attempts" class="block text-sm font-medium text-gray-700">Tentatives de connexion</label>
                <input type="number" id="login_attempts" v-model="userHistory.login_attempts" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required min="0" />
              </div>
              <div class="grid gap-1">
                <label for="password_last_changed" class="block text-sm font-medium text-gray-700">Dernier changement de mot de passe</label>
                <input type="datetime-local" id="password_last_changed" v-model="userHistory.password_last_changed" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div class="grid gap-1">
                <label for="created_at" class="block text-sm font-medium text-gray-700">Créé le</label>
                <input type="datetime-local" id="created_at" v-model="userHistory.created_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div class="grid gap-1">
                <label for="updated_at" class="block text-sm font-medium text-gray-700">Mis à jour le</label>
                <input type="datetime-local" id="updated_at" v-model="userHistory.updated_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
              </div>
              <div class="grid gap-1">
                <label for="deleted_at" class="block text-sm font-medium text-gray-700">Supprimé le</label>
                <input type="datetime-local" id="deleted_at" v-model="userHistory.deleted_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" />
              </div>
              <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
            </form>
      
            <div v-if="mode === 'delete'" class="grid gap-4">
              <p>Êtes-vous sûr de vouloir supprimer cet historique utilisateur ?</p>
              <div class="flex gap-4">
                <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
                <button @click="deleteUserHistory" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
              </div>
            </div>
          </div>
        </section>
      </template>
      
      <script setup lang="ts">
      import { ref, onMounted } from 'vue';
      import { useRoute, useRouter } from 'vue-router';
      
      interface UserHistory {
        id?: string;
        email: string;
        password: string;
        role: string;
        is_verified: boolean;
        login_attempts: number;
        password_last_changed?: string;
        created_at?: string;
        updated_at?: string;
        deleted_at?: string;
      }
      
      const route = useRoute();
      const router = useRouter();
      const userHistory = ref<UserHistory>({
        email: '',
        password: '',
        role: 'user',
        is_verified: false,
        login_attempts: 0,
        password_last_changed: '',
        created_at: '',
        updated_at: '',
        deleted_at: '',
      });
      const apiUrl = import.meta.env.VITE_API_URL as string;
      const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');
      
      onMounted(async () => {
        if (mode.value === 'edit' || mode.value === 'delete') {
          try {
            const response = await fetch(`${apiUrl}/user_history/${route.params.id}`);
            if (!response.ok) {
              throw new Error('Error fetching user history');
            }
            userHistory.value = await response.json();
          } catch (error) {
            console.error('Error fetching user history:', error);
          }
        }
      });
      
      const submitForm = async () => {
        try {
          const method = mode.value === 'new' ? 'POST' : 'PATCH';
          const url = mode.value === 'new' ? `${apiUrl}/user_history/new` : `${apiUrl}/user_history/${route.params.id}`;
      
          const { id, ...payload } = userHistory.value;
      
          const response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
          });
          if (!response.ok) {
            throw new Error('Error saving user history');
          }
          window.dispatchEvent(new CustomEvent(`user-history-${mode.value === 'new' ? 'added' : 'updated'}`));
          setTimeout(() => {
            router.push({ name: 'DBUserHistoryIndex' });
          }, 100);
        } catch (error) {
          console.error('Error saving user history:', error);
        }
      };
      
      const deleteUserHistory = async () => {
        try {
          const response = await fetch(`${apiUrl}/user_history/${route.params.id}`, {
            method: 'DELETE',
          });
          if (response.ok) {
            window.dispatchEvent(new CustomEvent('user-history-deleted'));
            setTimeout(() => {
              router.push({ name: 'DBUserHistoryIndex' });
            }, 100);
          } else {
            console.error('Failed to delete user history');
          }
        } catch (error) {
          console.error('Error deleting user history:', error);
        }
      };
      
      const goBack = () => {
        router.push({ name: 'DBUserHistoryIndex' });
      };
      </script>
      