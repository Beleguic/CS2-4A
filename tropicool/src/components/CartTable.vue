<template>
  <section class="w-3/4 py-4">
    <div>
      <div class="flex gap-4">
        <div class="font-bold w-3/5">Produit</div>
        <div class="font-bold flex-1">Quantité</div>
        <div class="font-bold flex-1">Total</div>
      </div>
      <div class="flex py-4 gap-4" v-for="item in cartItems" :key="item.product_id">
        <div class="w-3/5 flex gap-4">
          <div>
            <img class="max-w-32 w-full" :src="item.image" alt="Produit">
          </div>
          <div class="grid gap-2">
            <h3>{{ item.name }}</h3>
            <p>{{ item.price }}€</p>
            <p class="text-gray-600"><span class="bold">Référence : </span>{{ item.reference }}</p>
            <button @click="removeFromCart(item.product_id, item.quantity)" class="border border-red-600 bg-transparent rounded-md text-red-600 hover:bg-red-600 hover:text-white flex gap-2 px-4 py-1 items-center">
              <svg width='8' height='9' viewBox='0 0 8 9' fill='none' xmlns='http://www.w3.org/2000/svg'>
                <path d='M7.5 0.5H5.75L5.25 0H2.75L2.25 0.5H0.5V1.5H7.5M1 8C1 8.26522 1.10536 8.51957 1.29289 8.70711C1.48043 8.89464 1.73478 9 2 9H6C6.26522 9 6.51957 8.89464 6.70711 8.70711C6.89464 8.51957 7 8.26522 7 8V2H1V8Z' fill='currentColor'/>
              </svg>
              <span class="text-sm">Retirer</span>
            </button>
          </div>
        </div>
        <div class="flex-1">
          <div class="grid gap-4">
            <span v-if="selectedItem !== item.product_id" class="py-1.5 px-2.5 block w-full border border-transparent">{{ item.quantity }}</span>
            <select v-else v-model="selectedQuantity" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm">
              <option v-for="i in 10" :key="i" :value="i">{{ i }}</option>
            </select>
            <div v-if="selectedItem !== item.product_id">
              <button @click="handleSelectItem(item.product_id, item.quantity)" class="bg-main hover:bg-secondary text-white px-2 py-1 rounded-md w-full">Éditer</button>
            </div>
            <div v-else class="grid gap-2">
              <button @click="handleUpdateQuantity(item.product_id)" class="bg-main hover:bg-secondary text-white px-2 py-1 rounded-md">Éditer</button>
              <button @click="cancelUpdate" class="bg-red-600 hover:bg-red-800 text-white px-2 py-1 rounded-md">Annuler</button>
            </div>
          </div>
        </div>
        <div class="flex-1">
          <span>€{{ (item.price * item.quantity).toFixed(2) }}</span>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { defineProps, ref, defineEmits } from 'vue';
import { useUpdateCartItemQuantity } from '../composables/useUpdateCartItemQuantity';

interface CartItem {
  product_id: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  reference: string;
}

defineProps<{
  cartItems: CartItem[];
  removeFromCart: (productId: string, quantity: number) => void;
}>();

const emit = defineEmits(['update-cart']);

const { selectedItem, selectedQuantity, selectItem, updateQuantity } = useUpdateCartItemQuantity();
const originalQuantity = ref<number | null>(null);

const handleUpdateQuantity = async (productId: string) => {
  const userId = localStorage.getItem('userId');
  const response = await updateQuantity(productId, userId);
  if (response.message.success) {
    emit('update-cart');
  } else {
    alert(response.message.error);
  }
};

const cancelUpdate = () => {
  selectedItem.value = null;
  selectedQuantity.value = originalQuantity.value ?? 1;
};

const handleSelectItem = (productId: string, quantity: number) => {
  originalQuantity.value = quantity;
  selectItem(productId, quantity);
};
</script>