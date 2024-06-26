<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 class="text-4xl font-bold mb-8 text-black">Ajout d'une catégorie</h1>
      <form @submit.prevent="newCategory" class="grid gap-6">
        <div class="grid gap-1">
          <label for="name" class="block text-sm font-medium text-gray-700">Nom de la catégorie</label>
          <input type="text" id="name" v-model="category.name"
            class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="url" class="block text-sm font-medium text-gray-700">URL de la catégorie</label>
          <input type="text" id="url" v-model="category.url"
            class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
          <input type="text" id="description" v-model="category.description"
            class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="image" class="block text-sm font-medium text-gray-700">Image</label>
          <input type="text" id="image" v-model="category.image"
            class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="flex flex-col gap-1 items-start">
          <label for="is_active" class="text-sm font-medium text-gray-700">Statut - {{ is_active ? 'Activé' :
            'Désactivé' }}</label>
          <input type="checkbox" id="is_active" class="p-2" v-model="is_active" required />
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">Ajouter</button>
      </form>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';

  interface Category {
    name: string;
    url: string;
    description: string;
    image: string;
    is_active: boolean;
  }

  const router = useRouter();
  const category = ref<Category>({
    name: '',
    url: '',
    description: '',
    image: 'temporary-image.jpg',
    is_active: true,
  });
  const apiUrl = import.meta.env.VITE_API_URL as string;
  const is_active = ref(true);

  const newCategory = async () => {
    try {
      const response = await fetch(`${apiUrl}/category/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(category.value),
      });
      if (!response.ok) {
        throw new Error('Error adding category');
      }
      window.dispatchEvent(new CustomEvent('category-added'));

      router.push({ name: 'DBCategoryIndex' });
    } catch (error) {
      console.error('Error adding category:', error);
    }
  };
</script>