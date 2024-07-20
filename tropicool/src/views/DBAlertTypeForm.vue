<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'un type d'alerte</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition du type d'alerte : <span class="capitalize">{{ alertType?.type }}</span></h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression du type d'alerte</h1>

      <FormComponent
          :fields="fields"
          v-model:formData="alertType"
          submitButtonText="Envoyer"
          @submit="submitForm"
        />

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce type d'alerte ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteAlertType" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import FormComponent from '../components/FormComponent.vue';

interface AlertType {
  id?: string;
  type: string;
}

const route = useRoute();
const router = useRouter();
const alertType = ref<AlertType>({
  type: '',
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

const fields = [
  {  
    field: [
      [{name: 'type', label: 'Type d\'alerte', type: 'text', required: true, placeholder: '', color: 'gray-700', min: 3, max: 255}], 
    ],
  },
];

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/alert_types/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching alert type');
      }
      alertType.value = await response.json();
    } catch (error) {
      console.error('Error fetching alert type:', error);
    }
  }
});

const submitForm = async (formData: AlertType) => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/alert_types/new` : `${apiUrl}/alert_types/${route.params.id}`;

    const { id, ...payload } = formData;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      throw new Error('Error saving alert type');
    }
    window.dispatchEvent(new CustomEvent(`alert-type-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBAlertTypeIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving alert type:', error);
  }
};

const deleteAlertType = async () => {
  try {
    const response = await fetch(`${apiUrl}/alert_types/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('alert-type-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBAlertTypeIndex' });
      }, 100);
    } else {
      console.error('Failed to delete alert type');
    }
  } catch (error) {
    console.error('Error deleting alert type:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBAlertTypeIndex' });
};
</script>
