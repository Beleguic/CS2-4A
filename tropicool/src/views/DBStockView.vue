<template>
    <section class="h-full">
        <div class="py-8 px-6">
            <div class="flex items-center justify-between mb-8">
                <div>
                    <h1 class="text-4xl font-bold text-black">Liste des mouvements de stock pour le produit : {{ productName }}</h1>
                </div>
                <div>
                    <router-link :to="{ name: 'DBStockIndex' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md m-4">Retour</router-link>
                    <router-link v-if="datas.length > 0" :to="{ name: 'DBStockRestock', params: { id: route.params.id } }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md">Ajouter</router-link>
                </div>
            </div>
            <template v-if="datas.length > 0">
                <Table :columns="columns" :datas="datas" newLink="" editLink="" deleteLink="" viewLink=""/>
            </template>
            <template v-else>
                <p class="text-center text-gray-500">Pas de stock trouvé</p>
            </template>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';
import dayjs from 'dayjs';
import Table from '../components/TableComponent.vue';
import {useRoute} from "vue-router";


const route = useRoute();
const productName = ref<string>('');
interface Stock {
    id: string;
    product: {
        id: string;
        name: string;
    };
    quantity: number;
    status: string;
    created_at: string;
    difference: string;
}

const datas = ref<Stock[]>([]);

const columns = [
    { key: 'productName', label: 'Produit' },
    { key: 'quantity', label: 'Quantité' },
    { key: 'difference', label: 'Différence'},
    { key: 'status', label: 'Opération'},
    { key: 'created_at', label: "Date d'ajout" },
];
//,
const apiUrl = import.meta.env.VITE_API_URL as string;

const fetchStocks = async () => {
    try {
        const id = route.params.id;
        const response = await axios.get<Stock[]>(`${apiUrl}/stock/${id}`);

        let productId = response.data.product.id;

        const responseProduit = await axios.get<Stock[]>(`${apiUrl}/stock/store-keeper/${productId}`);

        const translateAction = (action) => {
            switch(action) {
                case 'add':
                    return 'Ajout';
                case 'remove':
                    return 'Retrait';
                default:
                    return action;
            }
        };

        // Map data to include productName at the top level and format the date
        productName.value = response.data.product.name;
        datas.value = responseProduit.data.map(stock => {
            const {status,  ...rest } = stock;
            return {
                ...rest,
                productName: stock.product.name,
                created_at: dayjs(stock.created_at).format('DD/MM/YYYY HH:mm'),
                status: translateAction(status) // Traduire l'action
            };
        });

    } catch (error) {
        console.error('Error fetching stocks:', error);
    }
};

onMounted(() => {
    fetchStocks();
});

</script>

<style scoped>

</style>
