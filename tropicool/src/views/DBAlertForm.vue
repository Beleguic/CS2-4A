<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter une alerte</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer l'alerte</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer l'alerte</h1>

      <FormComponent
        v-if="mode !== 'delete'"
        v-model="alert"
        :fields="fields"
        :submitButtonText="mode === 'new' ? 'Ajouter' : 'Mettre à jour'"
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
import { ref, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

interface Alert {
  id?: string;
  alert_type_id: string;
  product_id?: string | null;
  category_id?: string | null;
  user_id?: string | null;
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

interface User {
  id: string;
  username: string;
}

const route = useRoute();
const router = useRouter();
const alert = ref<Alert>({
  alert_type_id: '',
  product_id: null,
  category_id: null,
  user_id: null,
});
const products = ref<Product[]>([]);
const categories = ref<Category[]>([]);
const alertTypes = ref<AlertType[]>([]);
const users = ref<User[]>([]);
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(
  route.name && typeof route.name === 'string' && route.name.includes('New') ? 'new' :
  route.name && typeof route.name === 'string' && route.name.includes('Edit') ? 'edit' : 'delete'
);
const fields = ref<any[]>([]);

const fetchProducts = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/product/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/category/list`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
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

const fetchAlertTypes = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/alert_types`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      alertTypes.value = data.map((alertType: AlertType) => ({ value: alertType.id, label: alertType.type }));
    } else {
      console.error('Error fetching Alert Types');
    }
  } catch (error) {
    console.error('Error fetching Alert Types:', error);
  }
};

const fetchUsers = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/users`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (response.ok) {
      const data = await response.json();
      users.value = data.map((user: User) => ({ value: user.id, label: user.username }));
    } else {
      console.error('Error fetching users');
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const generateFields = () => [
  {  
    field: [
      [{name: 'alert_type_id', label: 'Type d\'alerte', type: 'select', required: true, placeholder: '', color: 'gray-700', options: alertTypes.value}],
      [{name: 'product_id', label: 'Produit', type: 'select', required: false, placeholder: '', color: 'gray-700', options: products.value}],
      [{name: 'category_id', label: 'Catégorie', type: 'select', required: false, placeholder: '', color: 'gray-700', options: categories.value}],
      [{name: 'user_id', label: 'Utilisateur', type: 'select', required: true, placeholder: '', color: 'gray-700', options: users.value}]
    ]
  }
];

const fetchAlert = async (id: string) => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/alert/${id}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    if (!response.ok) {
      throw new Error('Error fetching alert');
    }
    const data = await response.json();
    alert.value = {
      id: data.id,
      alert_type_id: data.alert_type_id,
      product_id: data.product_id,
      category_id: data.category_id,
      user_id: data.user_id,
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error fetching alert:', error);
  }
};

onMounted(async () => {
  await fetchProducts();
  await fetchCategories();
  await fetchAlertTypes();
  await fetchUsers();

  if (mode.value === 'edit' || mode.value === 'delete') {
    await fetchAlert(route.params.id as string);
  }

  fields.value = generateFields();
});

watch(
  () => alert.value,
  () => {
    fields.value = generateFields();
  },
  { deep: true }
);

const submitForm = async () => {
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/alert/new` : `${apiUrl}/alert/${route.params.id}`;

    const { id, updated_at, created_at, ...payload } = alert.value;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
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
  const token = localStorage.getItem('token');
  if (!token) {
    console.error('No token found');
    return;
  }

  try {
    const response = await fetch(`${apiUrl}/alert/${route.params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
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
