<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 class="text-4xl font-bold mb-8 text-black">Édition de la catégorie : <span class="capitalize">{{ category?.name }}</span></h1>
      <div v-if="category">
        <form @submit.prevent="updateCategory" class="grid gap-6">
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
            <label for="is_active" class="block text-sm font-medium text-gray-700">Status - {{ category.is_active ? 'Activé' : 'Désactivé' }}</label>
            <input type="checkbox" id="is_active" v-model="category.is_active" class="p-2" />
          </div>
          <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">Mettre à jour</button>
        </form>
      </div>
      <div v-else>
        Chargement...
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute, useRouter } from 'vue-router';

  interface Category {
    id: number;
    name: string;
    url: string;
    description: string;
    image: string;
    is_active: boolean;
    createdAt: string;
    updatedAt: string;
  }

  const route = useRoute();
  const router = useRouter();
  const category = ref<Category | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL as string;

  onMounted(async () => {
    try {
      const response = await fetch(`${apiUrl}/category/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching category');
      }
      category.value = await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  });

  const updateCategory = async () => {
    if (category.value) {
      try {
        const response = await fetch(`${apiUrl}/category/${route.params.id}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(category.value)
        });
        if (!response.ok) {
          throw new Error('Error updating category');
        }
        window.dispatchEvent(new CustomEvent('category-updated'));

        router.push({ name: 'DBCategoryIndex' });
      } catch (error) {
        console.error('Error updating category:', error);
      }
    }
  };
</script>