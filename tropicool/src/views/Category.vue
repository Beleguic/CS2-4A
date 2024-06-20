<template>
    <div class="max-w-5xl w-full py-4">
      <h1 class="text-4xl font-bold mb-8 text-black">Toutes les catégories</h1>
      <section id="categories">
        <ul class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 grid-flow-row gap-8 flex-wrap py-4">
          <Cards 
            v-for="category in categories" 
            :key="category.id" 
            :name="category.name" 
            :url="`/category/${category.name}`" 
            :imgUrl="category.imgUrl || '../uploads/temporary-image.jpg'" 
          />
        </ul>
      </section>
    </div>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';
    import Cards from '../components/CardsComponent.vue';

    const categories = ref([]);
    const apiUrl = import.meta.env.VITE_API_URL;

    onMounted(async () => {
        try {
            const response = await axios.get(`${apiUrl}/category`);
            categories.value = response.data;
        } catch (error) {
            console.error('Error fetching categories:', error);
        }
      }
    );
</script>

<style></style>