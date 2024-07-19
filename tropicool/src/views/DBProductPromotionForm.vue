<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter une promotion de produit</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer la promotion de produit</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer la promotion de produit</h1>

      <FormComponent
        :fields="fields"
        v-model:formData="productPromotion"
        submitButtonText="Envoyer"
        @submit="submitForm"
      />

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette promotion de produit ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteProductPromotion" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';
import dayjs from 'dayjs';

interface ProductPromotion {
  id?: string;
  product_id: string;
  start_at: string;
  end_at: string;
}

interface Product {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const productPromotion = ref<ProductPromotion>({
  product_id: '',
  start_at: '',
  end_at: '',
});
const products = ref<Product[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');
const fields = ref<any[]>([]);

const fetchProducts = async () => {
  try {
    const response = await fetch(`${apiUrl}/product/list`);
    if (response.ok) {
      const data = await response.json();
      products.value = data.map((product: Product) => ({ value: product.id, label: product.name }));
    } else {
      console.error('Error fetching products');
    }
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const generateFields = () => [
  {  
    field: [
      [{name: 'product_id', label: 'Produit', type: 'select', required: true, placeholder: '', color: 'gray-700', options: products.value,}],
      [{name: 'start_at', label: 'Début de la promotion', type: 'datetime-local', required: true, placeholder: '', color: 'gray-700',}],
      [{name: 'end_at', label: 'Fin de la promotion', type: 'datetime-local', required: true, placeholder: '', color: 'gray-700',}]
    ]
  }
];

onMounted(async () => {

  await fetchProducts();

  fields.value = generateFields();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/product_promotion/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Network response was not ok');
      }
      const data = await response.json();
      const { product, start_at, end_at, ...rest } = data; // Exclude product from data
      productPromotion.value = {
        ...rest,
        start_at: dayjs(start_at).format('YYYY-MM-DDTHH:mm'),
        end_at: dayjs(end_at).format('YYYY-MM-DDTHH:mm'),
      };
    } catch (error) {
      console.error('Error fetching product promotion:', error);
    }
  }
  try {
    const productResponse = await fetch(`${apiUrl}/product`);
    if (!productResponse.ok) {
      throw new Error('Network response was not ok');
    }
    products.value = await productResponse.json();
  } catch (error) {
    console.error('Error fetching products:', error);
  }
});


const submitForm = async (formData: ProductPromotion) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/product_promotion/new` : `${apiUrl}/product_promotion/${route.params.id}`;

    const { id, product, ...payload } = formData // Exclude product from data

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const responseData = await response.json();
    console.log('Response:', responseData); // Log the response

    if (![200, 201].includes(response.status)) {
      throw new Error('Error saving product promotion');
    }

    window.dispatchEvent(new CustomEvent(`product-promotion-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBProductPromotionIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving product promotion:', error);
  }
};

const deleteProductPromotion = async () => {
  try {
    const response = await fetch(`${apiUrl}/product_promotion/${route.params.id}`, {
      method: 'DELETE',
    });

    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('product-promotion-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBProductPromotionIndex' });
      }, 100);
    } else {
      console.error('Failed to delete product promotion');
    }
  } catch (error) {
    console.error('Error deleting product promotion:', error);
  }
};


const goBack = () => {
  router.push({ name: 'DBProductPromotionIndex' });
};
</script>
