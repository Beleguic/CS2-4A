<template>
    <div class="product-page" v-if="isAllowed">
      <div class="product-container">
        <div class="product-image">
          <img :src="product.image" alt="product image" class="product-image"/>
        </div>
        <div class="product-details">
          <h1 class="product-name">{{ product.name }}</h1>
          <p class="product-description">{{ product.description }}</p>
          <div class="product-price">
            <label for="quantity">Quantité</label>
            <div class="quantity-input-container">
              <button @click="decreaseQuantity" class="quantity-button">-</button>
              <input type="number" v-model="quantity" min="1" class="quantity-input"/>
              <button @click="increaseQuantity" class="quantity-button">+</button>
            </div>
            <p>Prix Total: {{ totalPrice }} €</p>
          </div>
          <p v-if="product.is_adult" class="alcohol-warning">Contient de l'alcool. À consommer avec modération.</p>
          <button @click="addToFridge" class="add-to-cart-button">
            <img src="/Iconfrigo.png" alt="Cart Icon" class="cart-icon" />
            Ajouter au frigo
          </button>
        </div>
      </div>
    </div>
    <div v-else class="access-denied">
      <p class="main-message">Vous devez être majeur pour accéder à cette page.</p>
      <p class="secondary-message">
        Vous aurez toute la vie pour savourer et partager des moments festifs avec modération grâce à nos alcools Trôpicool !
        N'hésitez pas à essayer nos produits sans alcool, car sans alcool, la fête est encore plus folle !
      </p>
      <br> 
      <router-link to="/product" class="redirect-button">Voir nos autres produits</router-link>
    </div>
  </template>
  
  
  <script setup>
    import { ref, computed, onMounted } from 'vue';
    import { useAuthStore } from '@/stores/authStore'; 
    import { useRouter } from 'vue-router';
    import axios from 'axios';
    
    const product = ref({});
    const quantity = ref(1);
    const isAllowed = ref(true);
    const router = useRouter();
    
    const authStore = useAuthStore();
    
    const fetchProduct = async () => {
      const productId = router.currentRoute.value.params.id;
      const apiUrl = import.meta.env.VITE_API_URL;
      try {
        const response = await fetch(`${apiUrl}/product/${productId}`);
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
          console.log('User data:', user);
          const age = calculateAge(new Date(user.dateOfBirth));
          console.log('User age:', age);
          if (age < 18) {
            isAllowed.value = false;
            console.log('Access denied: User is not an adult.');
          } else {
            isAllowed.value = true;
            console.log('Access granted: User is an adult.');
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          isAllowed.value = false;
        }
      } else {
        isAllowed.value = false;
        console.log('Access denied: No user ID found.');
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
    
    const addToFridge = () => {
      console.log(`Product ${product.value.name} added to fridge`);
    };
    
    const increaseQuantity = () => {
      quantity.value += 1;
    };
    
    const decreaseQuantity = () => {
      if (quantity.value > 1) {
        quantity.value -= 1;
      }
    };
    
    const totalPrice = computed(() => {
      return (product.value.price * quantity.value).toFixed(2);
    });
    
    onMounted(() => {
      console.log('Fetching product...');
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
    width: 80%; /* Ajustez cette valeur pour augmenter la largeur */
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
  
  .quantity-input-container {
    display: flex;
    align-items: center;
  }
  
  .quantity-input {
    margin: 0 10px;
    width: 70px;
    padding: 10px;
    font-size: 18px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #fff;
    color: #000;
    text-align: center;
    -moz-appearance: textfield;
  }
  
  .quantity-input::-webkit-outer-spin-button,
  .quantity-input::-webkit-inner-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  
  .quantity-button {
    width: 30px;
    height: 30px;
    background-color: #ccc;
    border: none;
    border-radius: 5px;
    font-size: 18px;
    font-weight: bold;
    color: #000;
    cursor: pointer;
    transition: background-color 0.3s;
  }
  
  .quantity-button:hover {
    background-color: #bbb;
  }
  
  .add-to-cart-button {
    background-color: #696BE2;
    color: #FEFEF6;
    font-size: 20px;
    font-weight: 500;
    padding: 15px 30px;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 10px;
    transition: background-color 0.3s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  }
  
  .add-to-cart-button:hover {
    background-color: #5756A1;
  }
  
  .cart-icon {
    width: 30px;
    height: 30px;
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

  .redirect-button {
  display: inline-block;
  padding: 10px 20px;
  background-color: #696BE2;
  color: white;
  border-radius: 10px;
  text-decoration: none;
  font-size: 1rem;
  transition: background-color 0.3s ease;
  }

  .redirect-button:hover {
    background-color: #5a5ccd; 
  }
</style>
  