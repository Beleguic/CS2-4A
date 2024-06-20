<template>
    <section class="h-full">
        <div class="py-8 px-6">
            <h1 class="text-4xl font-bold mb-8 text-black">Suppression de la catégorie: </h1>
            <div v-if="category">
                <!-- Add confirmation UI or other elements here to delete the category -->
            </div>
            <div v-else>
                Chargement...
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
    import { ref, onMounted } from 'vue';
    import { useRoute } from 'vue-router';
    import axios from 'axios';

    const route = useRoute();
    const category = ref(null);
    const apiUrl = import.meta.env.VITE_API_URL;

    onMounted(async () => {
        try {
            const response = await axios.get(`${apiUrl}/category/${route.params.id}`);
            category.value = response.data;
        } catch (error) {
            console.error('Error fetching category:', error);
        }
    });
</script>

<style scoped>
/* Add any required styles here */
</style>
