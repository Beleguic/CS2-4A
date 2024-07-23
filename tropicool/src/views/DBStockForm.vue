<template>
    <section class="h-full">
        <div class="py-8 px-6">
            <div class="flex items-center justify-between">
              <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un stock</h1>
              <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer le stock</h1>
              <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer le stock</h1>
              <h1 v-if="mode === 'restock'" class="text-4xl font-bold mb-8 text-black">Restock du produit {{ productName }}</h1>
              <router-link v-if="mode === 'restock'" :to="{ name: 'DBStockView', params: { id: route.params.id }}" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md m-4">Retour</router-link>
              <router-link v-if="mode !== 'restock'" :to="{ name: 'DBStockIndex' }" class="bg-main text-white hover:bg-secondary px-4 py-2 rounded-md m-4">Retour</router-link>
            </div>
            <p v-if="mode === 'restock'" class="text-2xl font-bold mb-8 text-black"> Stock actuelle du produit : {{ quantityText }}</p>
            <FormComponent
                v-if="mode !== 'delete'"
                v-model="stock"
                :fields="formFields"
                :submitButtonText="mode === 'new' ? 'Ajouter' : (mode === 'update' ? 'Mettre à jour' : `Restock du produit ${productName}`)"
                @submit="submitForm"
            />

            <div v-if="mode === 'delete'" class="grid gap-4">
                <p>Êtes-vous sûr de vouloir supprimer ce stock ?</p>
                <div class="flex gap-4">
                    <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
                    <button @click="deleteStock" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
                </div>
            </div>
        </div>
    </section>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';
import FormComponent from '../components/FormComponent.vue';

interface Stock {
  id?: string;
  product_id: string;
  quantity: number;
  status: string;
  difference: string;
}

interface Product {
  id: string;
  name: string;
}
const productName = ref<string>('');
const route = useRoute();
const router = useRouter();
const stock = ref<Stock>({
  product_id: '',
  quantity: 0,
  status: 'add',
  difference: '+0',
});
const products = ref<Product[]>([]);
const latestStock = ref<Stock | null>(null);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete' | 'restock'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : route.name?.includes('Restock') ? 'restock' : 'delete');
const quantityText = ref('0');

// Définir les champs du formulaire pour MyFormComponent
const formFields = ref([
  {
    header: '',
    field: [
      [{type: 'select', name: 'product_id', label: 'Produit', options: products.value.map(product => ({ value: product.id, label: product.name })), required: true,},],
      [{type: 'number', name: 'quantity', label: 'Quantité', placeholder: 'Entrez la quantité', required: true, min: 1,},],
      [{type: 'select', name: 'status', label: 'Status', options: [{ value: 'add', label: 'Ajout' }, { value: 'remove', label: 'Suppression' },], required: true,},],
    ],
  },
]);

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete' || mode.value === 'restock') {
    try {
      const response = await axios.get<Stock>(`${apiUrl}/stock/${route.params.id}`);
        productName.value = response.data.product.name;
        const { product, created_at, ...rest } = response.data;
        stock.value = rest;

      if(mode.value === 'restock') {
        let productId = product.id;
        const responseRestock = await axios.get<Stock>(`${apiUrl}/stock/store-keeper`, {
          params: { product_id: productId },
        });

        const { created_at, ...restStock } = responseRestock.data[0];
        stock.value = restStock;
        quantityText.value = stock.value.quantity.toString();
        stock.value.quantity = 0;
        stock.value.status = 'add';
        stock.value.id = undefined;
      }

    } catch (error) {
      console.error('Error fetching stock:', error);
    }
  }
  try {
    const productResponse = await axios.get<{ products: Product[] }>(`${apiUrl}/product`);
    products.value = productResponse.data.products;
    formFields.value[0].field[0][0].options = products.value.map(product => ({ value: product.id, label: product.name }));  // Mettre à jour les options du select
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});

watch(
  () => stock.value.product_id,
  async (newProductId) => {
    if (newProductId) {
      try {
        const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
          params: { product_id: newProductId },
        });
        const stockData = stockResponse.data;
        latestStock.value = stockData.length ? stockData[stockData.length - 1] : null;
      } catch (error) {
        console.error('Error fetching latest stock:', error);
      }
    }
  }
);

watch(
  () => [stock.value.quantity, stock.value.status],
  ([newQuantity, newStatus]) => {
    const quantity = parseInt(newQuantity.toString(), 10);
    stock.value.difference = newStatus === 'add' ? `+${quantity}` : `-${quantity}`;
  }
);

const submitForm = async () => {
  try {
    if (stock.value.quantity <= 0) {
      alert('La quantité doit être supérieure à 0.');
      return;
    }

    if (latestStock.value) {
      if (stock.value.status === 'remove' && stock.value.quantity > latestStock.value.quantity) {
        alert('La quantité à supprimer ne peut pas dépasser la quantité en stock');
        return;
      }
    } else {
      if (stock.value.status === 'remove') {
        alert('Impossible de supprimer des stocks qui n\'existent pas');
        return;
      }
    }

    const method = (mode.value === 'new' || mode.value === 'restock') ? 'POST' : 'PATCH';
    const url = (mode.value === 'new' || mode.value === 'restock') ? `${apiUrl}/stock/new` : `${apiUrl}/stock/${route.params.id}`;

    const { id, product, created_at, ...payload } = stock.value;  // Exclure product et created_at des données

    if (latestStock.value) {
      const newTotalQuantity = stock.value.status === 'add'
        ? latestStock.value.quantity + stock.value.quantity
        : latestStock.value.quantity - stock.value.quantity;
      
      payload.quantity = newTotalQuantity;
      payload.difference = stock.value.status === 'add' ? `+${stock.value.quantity}` : `-${stock.value.quantity}`;
    }

    const response = await axios({
      method,
      url,
      headers: {
        'Content-Type': 'application/json',
      },
      data: payload,
    });

    if (response.status === 200 || response.status === 201) {
      if(mode.value === 'restock') {
        router.push({ name: 'DBStockView', params: { id: route.params.id } });
      } else {
        window.dispatchEvent(new CustomEvent(`stock-${mode.value === 'new' ? 'added' : 'updated'}`));
        setTimeout(() => {
          router.push({ name: 'DBStockIndex' });
        }, 100);
      }
    } else {
      throw new Error('Error saving stock');
    }
  } catch (error) {
    console.error('Error saving stock:', error);
  }
};

const deleteStock = async () => {
  try {
    const response = await axios.delete(`${apiUrl}/stock/${route.params.id}`);
    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('stock-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBStockIndex' });
      }, 100);
    } else {
      console.error('Failed to delete stock');
    }
  } catch (error) {
    console.error('Error deleting stock:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBStockIndex' });
};
</script>
