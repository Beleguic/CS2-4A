<template>
    <section class="h-full">
        <div class="py-8 px-6">
            <h1 class="text-4xl font-bold mb-8 text-black">Édition de la catégorie : {{ category?.name }}</h1>
            <div v-if="category">
                <form @submit.prevent="updateCategory">
                    <div class="mb-4">
                        <label for="name" class="block text-sm font-medium text-gray-700">Nom de la catégorie</label>
                        <input
                            type="text"
                            id="name"
                            v-model="category.name"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div class="mb-4">
                        <label for="url" class="block text-sm font-medium text-gray-700">URL de la catégorie</label>
                        <input
                            type="text"
                            id="url"
                            v-model="category.url"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div class="mb-4">
                        <label for="description" class="block text-sm font-medium text-gray-700">Description</label>
                        <input
                            type="text"
                            id="description"
                            v-model="category.description"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div class="mb-4">
                        <label for="image" class="block text-sm font-medium text-gray-700">Image</label>
                        <input
                            type="text"
                            id="image"
                            v-model="category.image"
                            class="mt-1 block w-full border border-gray-300 rounded-md shadow-sm"
                        />
                    </div>
                    <div class="mb-4">
                        <label for="is_active" class="block text-sm font-medium text-gray-700">Actif</label>
                        <input
                            type="checkbox"
                            id="is_active"
                            v-model="category.is_active"
                            class="mt-1"
                        />
                    </div>
                    <button type="submit" class="px-4 py-2 bg-blue-500 text-white rounded-md">Mettre à jour</button>
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

const route = useRoute();
const router = useRouter();
const category = ref(null);
const apiUrl = import.meta.env.VITE_API_URL;

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
        router.push('/dashboard/category');
    } catch (error) {
        console.error('Error updating category:', error);
    }
};
</script>

<style scoped>
/* Add any required styles here */
</style>
