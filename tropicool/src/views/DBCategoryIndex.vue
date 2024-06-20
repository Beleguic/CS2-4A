<template>
    <section class="h-full">
        <div class="py-8 px-6">
            <h1 class="text-4xl font-bold mb-8 text-black">Toutes les catégories</h1>
            <Table 
                :columns="columns"
                :datas="datas"
                EditLink="DBCategoryEdit"
                DeleteLink="DBCategoryDelete"
            />
        </div>
        <router-view></router-view>
    </section>
</template>

<script setup>
    import { ref, onMounted } from 'vue';
    import axios from 'axios';

    import Table from '../components/TableComponent.vue';

    const datas = ref([]);

    const columns = [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Nom' },
        { key: 'isActive', label: 'Actif' },
        { key: 'createdAt', label: 'Crée le' },
        { key: 'updatedAt', label: 'Modifié le' },
        { key: 'actions', label: 'Actions' },
    ];

    const apiUrl = import.meta.env.VITE_API_URL;

    onMounted(async () => {
        try {
            const response = await axios.get(`${apiUrl}/category`);
            datas.value = response.data;
        } catch (error) {
            console.error('Error fetching datas:', error);
        }
    });
</script>

<style scoped>
/* Add any required styles here */
</style>
