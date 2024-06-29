<template>
  <section class="h-full">
    <div class="py-8 px-6 grid gap-4">
      <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
      <div class="flex gap-4">
        <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
        <button @click="deleteCategory" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const apiUrl = import.meta.env.VITE_API_URL as string;

const deleteCategory = async () => {
  try {
    const response = await fetch(`${apiUrl}/category/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('category-deleted'));
      setTimeout(() => {router.push({ name: 'DBCategoryIndex' });}, 100);
    } else {
      console.error('Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBCategoryIndex' });
};
</script>