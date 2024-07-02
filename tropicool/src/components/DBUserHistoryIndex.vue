<template>
        <section class="h-full">
          <div class="py-8 px-6">
            <div class="flex items-center justify-between mb-8">
              <h1 class="text-4xl font-bold text-black">Liste des historiques utilisateurs</h1>
              <router-link :to="{ name: 'DBUserHistoryNew' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
            </div>
            <template v-if="datas.length > 0">
              <Table :columns="columns" :datas="datas" editLink="DBUserHistoryEdit" deleteLink="DBUserHistoryDelete" />
            </template>
            <template v-else>
              <p class="text-center text-gray-500">Pas d'historique utilisateur trouvé</p>
            </template>
          </div>
        </section>
      </template>
      
      <script setup lang="ts">
      import { ref, onMounted, onBeforeUnmount } from 'vue';
      import axios from 'axios';
      import Table from '../components/TableComponent.vue';
      
      interface UserHistory {
        id: string;
        email: string;
        role: string;
        is_verified: boolean;
        login_attempts: number;
        password_last_changed: string;
        created_at: string;
        updated_at: string;
        deleted_at: string;
      }
      
      const datas = ref<UserHistory[]>([]);
      
      const columns = [
        { key: 'id', label: 'ID' },
        { key: 'email', label: 'Email' },
        { key: 'role', label: 'Rôle' },
        { key: 'is_verified', label: 'Vérifié' },
        { key: 'login_attempts', label: 'Tentatives de connexion' },
        { key: 'password_last_changed', label: 'Dernier changement de mot de passe' },
        { key: 'created_at', label: 'Créé le' },
        { key: 'updated_at', label: 'Mis à jour le' },
        { key: 'deleted_at', label: 'Supprimé le' },
        { key: 'actions', label: 'Actions' },
      ];
      
      const apiUrl = import.meta.env.VITE_API_URL as string;
      
      const fetchUserHistories = async () => {
        try {
          const response = await axios.get<UserHistory[]>(`${apiUrl}/user_history/`);
          datas.value = response.data;
        } catch (error) {
          console.error('Error fetching user histories:', error);
        }
      };
      
      onMounted(() => {
        fetchUserHistories();
      
        const handleUserHistoryUpdated = () => fetchUserHistories();
        const handleUserHistoryAdded = () => fetchUserHistories();
        const handleUserHistoryDeleted = () => fetchUserHistories();
      
        window.addEventListener('user-history-updated', handleUserHistoryUpdated);
        window.addEventListener('user-history-added', handleUserHistoryAdded);
        window.addEventListener('user-history-deleted', handleUserHistoryDeleted);
      
        onBeforeUnmount(() => {
          window.removeEventListener('user-history-updated', handleUserHistoryUpdated);
          window.removeEventListener('user-history-added', handleUserHistoryAdded);
          window.removeEventListener('user-history-deleted', handleUserHistoryDeleted);
        });
      });
      </script>
      