<template>
        <section class="h-full">
          <div class="py-8 px-6">
            <div class="flex items-center justify-between mb-8">
              <h1 class="text-4xl font-bold text-black">Liste des historiques de mots de passe</h1>
              <router-link :to="{ name: 'DBPasswordHistoryNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
            </div>
            <template v-if="datas.length > 0">
              <Table :columns="columns" :datas="datas" editLink="DBPasswordHistoryEdit" deleteLink="DBPasswordHistoryDelete" />
            </template>
            <template v-else>
              <p class="text-center text-gray-500">Pas d'historique trouvé</p>
            </template>
          </div>
        </section>
      </template>
      
      <script setup lang="ts">
      import { ref, onMounted, onBeforeUnmount } from 'vue';
      import axios from 'axios';
      import Table from '../components/TableComponent.vue';
      
      interface PasswordHistory {
        id: string;
        user: {
          id: string;
          name: string;
          email: string;
        };
        created_at: string;
      }
      
      const datas = ref<PasswordHistory[]>([]);
      
      const columns = [
        { key: 'id', label: 'ID' },
        { key: 'user.name', label: 'Utilisateur' },
        { key: 'created_at', label: 'Date d\'ajout' },
        { key: 'actions', label: 'Actions' },
      ];
      
      const apiUrl = import.meta.env.VITE_API_URL as string;
      
      const fetchPasswordHistories = async () => {
        try {
          const response = await axios.get<PasswordHistory[]>(`${apiUrl}/password_history/`);
          datas.value = response.data;
        } catch (error) {
          console.error('Error fetching password histories:', error);
        }
      };
      
      onMounted(() => {
        fetchPasswordHistories();
      
        const handlePasswordHistoryUpdated = () => fetchPasswordHistories();
        const handlePasswordHistoryAdded = () => fetchPasswordHistories();
        const handlePasswordHistoryDeleted = () => fetchPasswordHistories();
      
        window.addEventListener('password-history-updated', handlePasswordHistoryUpdated);
        window.addEventListener('password-history-added', handlePasswordHistoryAdded);
        window.addEventListener('password-history-deleted', handlePasswordHistoryDeleted);
      
        onBeforeUnmount(() => {
          window.removeEventListener('password-history-updated', handlePasswordHistoryUpdated);
          window.removeEventListener('password-history-added', handlePasswordHistoryAdded);
          window.removeEventListener('password-history-deleted', handlePasswordHistoryDeleted);
        });
      });
      </script>
      