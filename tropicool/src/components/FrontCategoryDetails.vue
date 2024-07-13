<template>
  <div class="max-w-7xl w-full py-4 mx-auto">
    <h1>Category Details</h1>
    <section v-if="category">
      <div>
        <h1>Name: <span class="capitalize">{{ category.name }}</span></h1>
        <p>Description: {{ category.description }}</p>
      </div>
      <hr class="my-8">
      <div>
        Tous les produits
      </div>
    </section>
    <section v-else>
      <p>Loading...</p>
    </section>
  </div>
</template>

<script setup lang="ts">
  import { ref, onMounted } from 'vue';
  import { useRoute } from 'vue-router';

  interface Category {
      name: string;
      description: string;
      url: string;
  }

  const route = useRoute();
  const category = ref<Category | null>(null);
  const apiUrl = import.meta.env.VITE_API_URL as string;

  onMounted(async () => {
      try {
          const response = await fetch(`${apiUrl}/category/${route.params.id}?frontend=true`);
          if (!response.ok) {
              throw new Error('Error fetching category');
          }
          category.value = await response.json() as Category;
      } catch (error) {
          console.error('Error fetching category:', error);
      }
  });
</script>
