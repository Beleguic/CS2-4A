<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'une catégorie</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de la catégorie : <span class="capitalize">{{ category.name }}</span></h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de la catégorie</h1>
      <div v-if="mode !== 'delete'">
        <FormComponent
          :fields="fields"
          v-model:formData="category"
          submitButtonText="Envoyer"
          @submit="submitForm"
        />
      </div>
      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteCategory" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

interface Category {
  id?: string;
  name: string;
  url: string;
  description: string;
  image: string;
  is_active: boolean;
  createdAt?: string;
  updatedAt?: string;
}

const route = useRoute();
const router = useRouter();
const category = ref<Category>({
  name: '',
  url: '',
  description: '',
  image: 'temporary-image.jpg',
  is_active: true,
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

const fields = [
  {  
    field: [
      [{name: 'name', label: 'Nom de la catégorie', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255}], 
      [{name: 'url', label: 'URL de la catégorie', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255}],
      [{name: 'description', label: 'Description', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255}],
      [{name: 'image', label: 'Image', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255}],
      [{name: 'is_active', label: 'Statut', type: 'checkbox', required: false, placeholder: '', color: 'gray-700', textOn: 'Activé', textOff: 'Désactivé' }],
    ],
  },
];

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/category/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching category');
      }
      category.value = await response.json();
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  }
});

const submitForm = async (formData) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/category/new` : `${apiUrl}/category/${route.params.id}`;
    console.log(formData);
    const { id, createdAt, updatedAt, created_at, updated_at, ...payload } = formData;
    console.log(payload);
    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error saving category');
    }
    window.dispatchEvent(new CustomEvent(`category-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBCategoryIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving category:', error);
  }
};

const deleteCategory = async () => {
  try {
    const response = await fetch(`${apiUrl}/category/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('category-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBCategoryIndex' });
      }, 100);
    } else {
      console.error('Failed to delete category');
    }
  } catch (error) {
    console.error('Error deleting category:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBCategoryIndex' });
};
</script>
