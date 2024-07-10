
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
    <p v-if="message" :class="messageClass">{{ message }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';

interface Props {
  item: string;
}

const props = defineProps<Props>();

const quantity = ref<number>(1);
const message = ref<string>('');
const messageType = ref<string>(''); // 'success' or 'error'

const messageClass = computed(() => {
  return messageType.value === 'error' ? 'text-red-500' : 'text-green-500';
});

import { useAddToCartFormValidation } from '../composables/useAddToCartFormValidation';

const addToCart = async () => {
  try {
    const userId = localStorage.getItem('userId');
    if (!userId) {
      message.value = 'You must be login to add to cart this product';
      messageType.value = 'error';
      return;
    }
    const response = await useAddToCartFormValidation(props.item, quantity.value, userId);
    message.value = response.message.error || response.message.success;
    messageType.value = response.message.error ? 'error' : 'success';
  } catch (error) {
    if (error instanceof Error) {
      message.value = error.message;
    } else {
      message.value = 'An unexpected error occurred';
    }
    messageType.value = 'error';
  }
};
</script>

<style scoped>
.text-red-500 {
  color: #f56565;
}
.text-green-500 {
  color: #48bb78;
}
</style>