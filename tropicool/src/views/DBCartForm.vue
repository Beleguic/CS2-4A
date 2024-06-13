<template>
  <section class="h-full">
    <div class="py-8 px-6">
      <h1 v-if="mode === 'new'" class="text-4xl font-bold mb-8 text-black">Ajout d'un panier</h1>
      <h1 v-if="mode === 'edit'" class="text-4xl font-bold mb-8 text-black">Édition du panier</h1>
      <h1 v-if="mode === 'delete'" class="text-4xl font-bold mb-8 text-black">Suppression du panier</h1>

      <form v-if="mode !== 'delete'" @submit.prevent="submitForm" class="grid gap-6">
        <div class="grid gap-1">
          <label for="user_id" class="block text-sm font-medium text-gray-700">Utilisateur</label>
          <select id="user_id" v-model="cart.user_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" required>
            <option v-for="user in users" :key="user.id" :value="user.id">{{ user.username }}</option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="product_id" class="block text-sm font-medium text-gray-700">Produit</label>
          <select id="product_id" v-model="selectedProduct.product_id" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" @change="updateSelectedProductStock">
            <option v-for="product in products" :key="product.id" :value="product.id" :disabled="product.stock <= 0">
              {{ product.name }} (Stock: {{ product.stock <= 0 ? 0 : product.stock }})
            </option>
          </select>
        </div>
        <div class="grid gap-1">
          <label for="quantity" class="block text-sm font-medium text-gray-700">Quantité</label>
          <input type="number" id="quantity" v-model="selectedProduct.quantity" class="p-2 block w-full border border-gray-300 rounded-md shadow-sm" min="1" :max="selectedProduct.maxQuantity || 10" />
        </div>
        <button type="button" @click="addProduct" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">Ajouter produit</button>
        <ul>
          <li v-for="(product, index) in cart.cartProductsData" :key="index" class="text-black">
            {{ product.name }} - {{ product.quantity }}
            <button type="button" @click="removeProduct(index)" class="text-red-500 ml-2">Supprimer</button>
          </li>
        </ul>
        <button type="submit" class="px-4 py-2 bg-main text-white rounded-md hover:bg-secondary">{{ mode === 'new' ? 'Ajouter' : 'Mettre à jour' }}</button>
      </form>

      <div v-if="mode === 'delete'" class="grid gap-4">
        <p>Êtes-vous sûr de vouloir supprimer ce panier ?</p>
        <div class="flex gap-4">
          <button @click="goBack" class="px-6 py-4 bg-blue-500 hover:bg-blue-800 rounded-md text-white">Non</button>
          <button @click="deleteCart" class="px-6 py-4 bg-red-500 hover:bg-red-800 rounded-md text-white">Oui</button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

interface User {
  id: string;
  username: string;
}

interface Product {
  id: string;
  name: string;
  stock: number;
  price: number;
  image: string;
  reference: string;
  is_adult: boolean;
  tva: number;
}

interface Stock {
  product_id: string;
  quantity: number;
  created_at: string;
}

interface Cart {
  id?: string;
  user_id: string;
  cartProductsData: Array<{ product_id: string; name: string; quantity: number; price: number; image: string; reference: string; is_adult: boolean; tva: number }>;
}

const route = useRoute();
const router = useRouter();
const users = ref<User[]>([]);
const products = ref<Product[]>([]);
const selectedProduct = ref<{ product_id: string; quantity: number; maxQuantity: number | null }>({
  product_id: '',
  quantity: 1,
  maxQuantity: null,
});
const cart = ref<Cart>({
  user_id: '',
  cartProductsData: [],
});
const apiUrl = import.meta.env.VITE_API_URL as string;
const mode = ref<'new' | 'edit' | 'delete'>(
  route.name && typeof route.name === 'string' && route.name.includes('New') ? 'new' :
  route.name && typeof route.name === 'string' && route.name.includes('Edit') ? 'edit' : 'delete'
);

onMounted(async () => {
  await fetchUsers();
  await fetchProducts();

  if (mode.value === 'edit' || mode.value === 'delete') {
    try {
      const response = await fetch(`${apiUrl}/cart/${route.params.id}`);
      if (!response.ok) {
        throw new Error('Error fetching cart');
      }
      const cartData = await response.json();
      cart.value = { ...cartData, cartProductsData: [] };
      cartData.cartProductsData.forEach((product: { product_id: string; quantity: number }) => {
        const prod = products.value.find(p => p.id === product.product_id);
        if (prod) {
          cart.value.cartProductsData.push({
            product_id: product.product_id,
            name: prod.name,
            quantity: product.quantity,
            price: prod.price,
            image: prod.image,
            reference: prod.reference,
            is_adult: prod.is_adult,
            tva: prod.tva
          });
        }
      });
    } catch (error) {
      console.error('Error fetching cart:', error);
    }
  }
});

const fetchUsers = async () => {
  try {
    const response = await axios.get<User[]>(`${apiUrl}/users`);
    users.value = response.data;
  } catch (error) {
    console.error('Error fetching users:', error);
  }
};

const fetchProducts = async () => {
  try {
    const productsResponse = await axios.get<Product[]>(`${apiUrl}/product`);
    const fetchedProducts = productsResponse.data;

    for (const product of fetchedProducts) {
      try {
        const stockResponse = await axios.get<Stock[]>(`${apiUrl}/stock`, {
          params: { product_id: product.id }
        });

        const stockData = stockResponse.data;
        const latestStock = stockData.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()).pop();

        if (latestStock) {
          product.stock = latestStock.quantity;
        } else {
          product.stock = 0;
        }
      } catch (error) {
        console.error(`Error fetching stock for product ${product.id}:`, error);
      }
    }

    products.value = fetchedProducts;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const updateSelectedProductStock = () => {
  const product = products.value.find(p => p.id === selectedProduct.value.product_id);
  if (product) {
    selectedProduct.value.maxQuantity = product.stock;
  } else {
    selectedProduct.value.maxQuantity = null;
  }
};

const addProduct = () => {
  const product = products.value.find(p => p.id === selectedProduct.value.product_id);
  if (!product) {
    alert('Produit non trouvé');
    return;
  }

  const existingProductInCart = cart.value.cartProductsData.find(p => p.product_id === selectedProduct.value.product_id);

  if (existingProductInCart) {
    const newQuantity = existingProductInCart.quantity + selectedProduct.value.quantity;
    if (newQuantity <= product.stock && newQuantity <= 10) {
      existingProductInCart.quantity = newQuantity;
    } else if (newQuantity > product.stock) {
      alert('Stock insuffisant');
    } else {
      alert('La quantité totale ne peut pas dépasser 10');
    }
  } else {
    if (selectedProduct.value.quantity <= product.stock && selectedProduct.value.quantity <= 10) {
      cart.value.cartProductsData.push({
        product_id: selectedProduct.value.product_id,
        name: product.name,
        quantity: selectedProduct.value.quantity,
        price: product.price,
        image: product.image,
        reference: product.reference,
        is_adult: product.is_adult,
        tva: product.tva
      });
    } else if (selectedProduct.value.quantity > product.stock) {
      alert('Stock insuffisant');
    } else {
      alert('La quantité totale ne peut pas dépasser 10');
    }
  }
  selectedProduct.value = { product_id: '', quantity: 1, maxQuantity: null };
};

const removeProduct = (index: number) => {
  cart.value.cartProductsData.splice(index, 1);
};

const submitForm = async () => {
  console.log("Cart value:", cart.value); // Ajouter ce log
  try {
    const method = mode.value === 'new' ? 'POST' : 'PATCH';
    const url = mode.value === 'new' ? `${apiUrl}/cart/new` : `${apiUrl}/cart/${route.params.id}`;
    
    const { id, cartProductsData, ...payload } = cart.value;
    const productsPayload = cartProductsData.map(product => ({
      product_id: product.product_id,
      name: product.name,
      quantity: product.quantity,
      price: product.price,
      image: product.image,
      reference: product.reference,
      is_adult: product.is_adult,
      tva: product.tva
    }));

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ ...payload, cartProductsData: productsPayload }),
    });

    if (!response.ok) {
      throw new Error('Error saving cart');
    }
    
    window.dispatchEvent(new CustomEvent(`cart-${mode.value === 'new' ? 'added' : 'updated'}`));
    setTimeout(() => {
      router.push({ name: 'DBCartIndex' });
    }, 100);
  } catch (error) {
    console.error('Error saving cart:', error);
  }
};

const deleteCart = async () => {
  try {
    const response = await fetch(`${apiUrl}/cart/${route.params.id}`, {
      method: 'DELETE',
    });
    if (response.ok) {
      window.dispatchEvent(new CustomEvent('cart-deleted'));
      setTimeout(() => {
        router.push({ name: 'DBCartIndex' });
      }, 100);
    } else {
      console.error('Failed to delete cart');
    }
  } catch (error) {
    console.error('Error deleting cart:', error);
  }
};

const goBack = () => {
  router.push({ name: 'DBCartIndex' });
};
</script>
