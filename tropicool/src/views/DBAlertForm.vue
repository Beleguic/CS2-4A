<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'une alerte</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de l'alerte</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de l'alerte</h1>

      <FormComponent
        :fields="fields"
        v-model:formData="alert"
        submitButtonText="Envoyer"
        @submit="submitForm"
      />

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette alerte ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteAlert" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

interface Alert {
  id?: string;
  alert_type_id: number;
  product_id?: string;
  category_id?: string;
  created_at?: string;
  updated_at?: string;
}

interface AlertType {
  id: string;
  type: string;
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
const alert = ref<Alert>({
  alert_type_id: 0,
  product_id: null,
  category_id: null,
});
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const alertType = ref<AlertType[]>([]);
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

const fetchAlertType = async () => {
  try {
    const response = await fetch(`${apiUrl}/alert_types`);
    if (response.ok) {
      const data = await response.json();
      alertType.value = data.map((alertType: AlertType) => ({ value: alertType.id, label: alertType.type }));
    } else {
      console.error('Error fetching Alert Types');
    }
  } catch (error) {
    console.error('Error fetching Alert Types:', error);
  }
};

const generateFields = () => [
  {  
    field: [
      [{name: 'alert_type_id', label: 'Type d\'alerte', type: 'select', required: true, placeholder: '', color: 'gray-700', options: alertType.value}],
      [{name: 'product_id', label: 'Produit', type: 'select', required: true, placeholder: '', color: 'gray-700', options: products.value}],
      [{name: 'category_id', label: 'Catégorie', type: 'select', required: true, placeholder: '', color: 'gray-700', options: categories.value}]
    ]
  }
];

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();
  await fetchAlertType();

  fields.value = generateFields();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/alert/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching alert');
      }
      alert.value = await response.json();
    } catch (error) {
      console.error('Error fetching alert:', error);
    }
  }
});

const submitForm = async (formData: Alert) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/alert/new` : `${apiUrl}/alert/${route.params.id}`;

    const { id, updated_at, created_at, ...payload } = formData;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error('Error saving alert');
    }
    window.dispatchEvent(new CustomEvent(`alert-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBAlertIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving alert:', error);
  }
};

const deleteAlert = async () => {
  try {
    const response = await fetch(`${apiUrl}/alert/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('alert-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBAlertIndex' });
      }, 100);
    } else {
      console.error('Failed to delete alert');
    }
  } catch (error) {
    console.error('Error deleting alert:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBAlertIndex' });
};
</script>
