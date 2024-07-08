<template>
  <div>
    <form @submit.prevent="addToCart">
      <div class="flex gap-4 flex-col">
        <div class="flex gap-4">
          <label for="qty">Quantité</label>  
          <select name="qty" id="qty" v-model="quantity">
            <option v-for="n in 20" :key="n" :value="n">{{ n }}</option>
          </select>
        </div>
        <button type="submit">Add to cart</button>
        <input type="hidden" name="product" id="product" :value="item">
      </div>
    </form>
    <p v-if="errorMessage" class="text-red-500">{{ errorMessage }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const props = defineProps({
  item: {
    type: String,
    required: true,
  },
});

const quantity = ref(1);
const errorMessage = ref('');

import { useAddToCartFormValidation } from '../composables/useAddToCartFromValidation';

const addToCart = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      errorMessage.value = 'You must be login to add to cart this product';
    }
    useAddToCartFormValidation(props.item, quantity.value, userId);
  } catch (error) {
    if (error instanceof Error) {
      errorMessage.value = error.message;
    } else {
      errorMessage.value = 'An unexpected error occurred';
    }
  }
};
</script>

<style scoped></style>