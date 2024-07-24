<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'une catégorie</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition de la catégorie : <span class="capitalize">{{ originalCategoryName }}</span></h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression de la catégorie</h1>
      <div v-if="mode !== 'delete'">
        <FormComponent :fields="fields" v-model="category" submitButtonText="Envoyer" @submit="submitForm" />
      </div>
      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer cette catégorie ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteCategory"
            class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
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
const originalCategoryName = ref<string>('');
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

const fields = [
  {
    field: [
      [{ name: 'name', label: 'Nom de la catégorie', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255 }],
      [{ name: 'url', label: 'URL de la catégorie', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255 }],
      [{ name: 'description', label: 'Description', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255 }],
      [{ name: 'image', label: 'Image', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255 }],
      [{ name: 'is_active', label: 'Statut', type: 'checkbox', required: false, placeholder: '', color: 'gray-700', textOn: 'Activé', textOff: 'Désactivé' }],
    ],
  },
];


const token = localStorage.getItem('token');
onMounted(async () => {
  if (!token) {
    throw new Error('No token found in localStorage');
  }

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/category/${route.params.id}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Error fetching category');
      }
      const data = await response.json();
      category.value = data;
      originalCategoryName.value = data.name;
    } catch (error) {
      console.error('Error fetching category:', error);
    }
  }
});

const submitForm = async (formData: Category) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const returnStatus = mode.value === 'new' ? 201 : 200;
    const returnMessage = mode.value === 'new' ? "crée" : "modifiée";
    const url = mode.value === 'new' ? `${apiUrl}/category/new` : `${apiUrl}/category/${route.params.id}`;

    const { id, ...payload } = formData;

    console.log("payload", payload);

    const response = await fetch(url, {
      method: method,
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    console.log("response", response)
    console.log("responsebody", response.body)

    if (response.status === returnStatus) {
      window.dispatchEvent(new CustomEvent(`category-${mode.value === 'new' ? 'added' : 'updated'}`));
      $toast.open({
        message: 'Catégorie ' + returnMessage + '!',
        type: 'success',
        position: 'bottom-left',
      });
      setTimeout(() => {
        router.push({ name: 'DBCategoryIndex' });
      }, 100);
    } else {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    });
  }
};

const deleteCategory = async () => {
  try {
    const response = await fetch(`${apiUrl}/category/${route.params.id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    if (response.status === 204) {
      window.dispatchEvent(new CustomEvent('category-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBCategoryIndex' });
      }, 100);
      $toast.open({
        message: 'Catégorie supprimée!',
        type: 'success',
        position: 'bottom-left',
      });
    } else {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    });
  }
};

const goBack = () => {
  router.push({ name: 'DBCategoryIndex' });
};
</script>
