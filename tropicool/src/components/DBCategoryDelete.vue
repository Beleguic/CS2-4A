<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
      <div class="flex gap-4">
        <button @click="deleteCategory" class="btn btn-danger">Oui</button>
        <button @click="goBack" class="btn btn-secondary">Non</button>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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
      router.push({ name: 'DBCategoryIndex' });
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