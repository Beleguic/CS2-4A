<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un code promotionnel</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer le code promotionnel</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer le code promotionnel</h1>

      <FormComponent
        :fields="fields"
        v-model:formData="promotionCode"
        submitButtonText="Envoyer"
        @submit="submitForm"
      />

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce code promotionnel ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deletePromotionCode" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

interface PromotionCode {
  id?: string;
  code: string;
  reduction: number;
  start_at: string | null;
  end_at: string | null;
}

interface Product {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

const route = useRoute();
const router = useRouter();
const promotionCode = ref<PromotionCode>({
  code: '',
  reduction: 1,
  start_at: null,
  end_at: null,
});
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
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

const fetchCategories = async () => {
  try {
    const response = await fetch(`${apiUrl}/category/list`);
    if (response.ok) {
      const data = await response.json();
      categories.value = data.map((category: Category) => ({ value: category.id, label: category.name }));
    } else {
      console.error('Error fetching categories');
    }
  } catch (error) {
    console.error('Error fetching categories:', error);
  }
};

const generateFields = () => [
  {  
    field: [
      [{name: 'product_id', label: 'Produit', type: 'select', required: true, placeholder: '', color: 'gray-700', options: products.value,}],
      [{name: 'category_id', label: 'Catégorie', type: 'select', required: true, placeholder: '', color: 'gray-700', options: categories.value,}],
      [{name: 'code', label: 'Code', type: 'text', required: true, placeholder: '', color: 'gray-700',}],
      [{name: 'start_at',label: 'Début',type: 'datetime-local',required: true,placeholder: '',color: 'gray-700',}],
      [{name: 'end_at',label: 'Fin',type: 'datetime-local',required: true,placeholder: '',color: 'gray-700',}]
    ]
  }
];

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();

  fields.value = generateFields();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/promotion_code/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching promotion code');
      }
      promotionCode.value = await response.json();
    } catch (error) {
      console.error('Error fetching alert:', error);
    }
  }
});

const submitForm = async (formData: PromotionCode) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/promotion_code/new` : `${apiUrl}/promotion_code/${route.params.id}`;

    const { id, updated_at, created_at, ...payload } = formData;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("response", response);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('Error:', errorData);
      throw new Error('Error saving promotion code');
    }
    window.dispatchEvent(new CustomEvent(`promotion-code-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBPromotionCodeIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving promotion code:', error);
  }
};

const deletePromotionCode = async () => {
  try {
    const response = await fetch(`${apiUrl}/promotion_code/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('promotion-code-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBPromotionCodeIndex' });
      }, 100);
    } else {
      console.error('Failed to delete promotion code');
    }
  } catch (error) {
    console.error('Error deleting promotion code:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBPromotionCodeIndex' });
};
</script>
