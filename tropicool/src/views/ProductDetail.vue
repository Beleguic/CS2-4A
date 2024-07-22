<template>
  <div class="product-page" v-if="isAllowed">
    <div class="product-container">
      <div class="product-image">
        <img v-if="product.image" :src="getImageUrl(product.image)" alt="product image" class="product-image"/>
      </div>
      <div class="product-details">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>
        <AddToCart
          :item="product.id"
          :price="product.price"
          :name="product.name" 
          @item-added="handleItemAdded"
        />
        <p v-if="product.is_adult" class="alcohol-warning">Contient de l'alcool. À consommer avec modération.</p>
      </div>
    </div>
    <ToastManager ref="toastManager" />
  </div>
  <div v-else class="access-denied">
    <p class="main-message">Vous devez être majeur pour accéder à cette page.</p>
    <p class="secondary-message">
      Vous aurez toute la vie pour savourer et partager des moments festifs avec modération grâce à nos alcools Troupicool !
      N'hésitez pas à essayer nos produits sans alcool, car sans alcool, la fête est encore plus folle !
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore'; 
import { useRouter } from 'vue-router';
import axios from 'axios';
import AddToCart from '../views/AddToCart.vue';
import ToastManager from '../components/ToastManager.vue';

const product = ref({
  id: '',
  price: 0,
  name: '',
  description: '',
  image: '',
  is_adult: false
});
const isAllowed = ref(true);
const router = useRouter();
const toastManager = ref(null);

const authStore = useAuthStore();

const fetchProduct = async () => {
  const productId = router.currentRoute.value.params.id;
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/product/${productId}?frontend=true`);
    const data = await response.json();
    product.value = data;
    if (data.is_adult) {
      checkAge();
    }
  } catch (error) {
    console.error('Error fetching product:', error);
  }
};

const checkAge = async () => {
  if (authStore.userId) {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await axios.get(`${apiUrl}/users/${authStore.userId}`);
      const user = response.data;
      const age = calculateAge(new Date(user.dateOfBirth));
      if (age < 18) {
        isAllowed.value = false;
      } else {
        isAllowed.value = true;
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      isAllowed.value = false;
    }
  } else {
    isAllowed.value = false;
  }
};

const calculateAge = (birthdate) => {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  console.log('Calculated age:', age);
  return age;
};

const getImageUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  let relativePath = path;

  if (!path) {
    console.error('Path is undefined or null');
    return '';
  }

  if (path.startsWith(baseUrl)) {
    relativePath = path.replace(baseUrl, '');
  }

  relativePath = relativePath.replace('/home/node/app', '');

  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  const imageUrl = `${baseUrl}${relativePath}`;
  
  console.log('Image URL:', imageUrl);
  return imageUrl;
};

const handleItemAdded = (productName) => {
  toastManager.value.addToast(`Produit ajouté au panier : ${productName}`, 'success');
};

onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
body {
  background-color: #FEFEF6;
  margin: 0;
  font-family: Arial, sans-serif;
}

.page-container {
  background-color: #FEFEF6;
  min-height: 100vh;
}

.product-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #FEFEF6;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
}

.product-container {
  display: flex;
  align-items: center;
  background-color: #fff;
  padding: 40px;
  border-radius: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  max-width: 1200px;
  width: 80%;
  min-height: 600px;
  box-sizing: border-box;
}

.product-image {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.product-image img {
  width: 100%;
  max-width: 400px;
  height: auto;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.product-details {
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
}

.product-name {
  font-size: 36px;
  font-weight: bold;
  color: #696BE2;
  margin-bottom: 20px;
}

.product-description {
  font-size: 20px;
  color: #4A4A4A;
  margin-bottom: 30px;
}

.age-verification {
  font-size: 20px;
  color: red;
  margin-bottom: 30px;
}

.verify-age-button {
  background-color: #696BE2;
  color: #FEFEF6;
  font-size: 18px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.verify-age-button:hover {
  background-color: #5756A1;
}

.product-price {
  font-size: 22px;
  font-weight: 500;
  color: #1D1F96;
  margin-bottom: 30px;
}

.alcohol-warning {
  color: red;
  font-size: 16px;
  margin-bottom: 20px;
}

.access-denied {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #FEFEF6;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  color: red;
}

.access-denied .main-message {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.access-denied .secondary-message {
  font-size: 18px;
  line-height: 1.5;
  max-width: 800px;
}
</style>
