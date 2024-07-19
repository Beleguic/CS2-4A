<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajouter un code promotionnel</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Éditer le code promotionnel</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Supprimer le code promotionnel</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="code" class="block text-sm font-medium text-gray-700">Code</label>
          <input type="text" id="code" v-model="promotionCode.code" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="reduction" class="block text-sm font-medium text-gray-700">Réduction (% du panier)</label>
          <input type="number" min="1" max="100" id="reduction" v-model="promotionCode.reduction" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required />
        </div>
        <div class="grid gap-1">
          <label for="start_at" class="block text-sm font-medium text-gray-700">Début</label>
          <input type="datetime-local" id="start_at" v-model="promotionCode.start_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <div class="grid gap-1">
          <label for="end_at" class="block text-sm font-medium text-gray-700">Fin</label>
          <input type="datetime-local" id="end_at" v-model="promotionCode.end_at" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm"/>
        </div>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

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

interface PromotionCode {
  id?: string;
  code: string;
  reduction: number;
  start_at: string | null;
  end_at: string | null;
}

const route = useRoute();
const router = useRouter();
const promotionCode = ref<PromotionCode>({
  code: '',
  reduction: 1,
  start_at: null,
  end_at: null,
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(route.name?.includes('New') ? 'new' : route.name?.includes('Edit') ? 'edit' : 'delete');

onMounted(async () => {
  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/promotion_code/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching promotion code');
      }
      promotionCode.value = await response.json();
    } catch (error) {
      console.error('Error fetching promotion code:', error);
    }
  }
});

const submitForm = async () => {
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/promotion_code/new` : `${apiUrl}/promotion_code/${route.params.id}`;

    const payload = {
      code: promotionCode.value.code,
      reduction: promotionCode.value.reduction,
      start_at: promotionCode.value.start_at || null,
      end_at: promotionCode.value.end_at || null
    };

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
