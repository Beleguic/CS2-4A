<template>
  <div class="product-container">
    <section class="landing-image-section">
      <img src="/landingproduct.jpg" alt="Landing Product" class="landing-image" />
    </section>
    <section class="content-section">
      <h1 class="title">Découvrez nos produits TROUPICOOL !!</h1>
      <p class="intro-text">Des produits de qualité pour des moments inoubliables</p>
    </section>
    <section class="products-section">
      <ProductCardComponent v-for="product in products" :key="product.id" :product="product" />
    </section>
    <section class="family-meal-section">
      <div class="family-meal-wrapper">
        <img src="/tropicool-meal-2.png" alt="Tropicool Family Meal Left" class="family-meal-image" />
        <div class="center-content">
          <img src="/tropicool-verre.png" alt="Tropicool Verre" class="family-meal-image center" />
          <button class="product-button center-button">Voir la boutique</button>
        </div>
        <img src="/tropicool-meal.png" alt="Tropicool Family Meal Right" class="family-meal-image" />
      </div>
    </section>
    <section class="transition-section"></section> 
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import ProductCardComponent from '../components/ProductCardComponent.vue';

const products = ref([]);
const apiUrl = import.meta.env.VITE_API_URL;

const fetchProducts = async () => {
  try {
    const response = await axios.get(`${apiUrl}/product?frontend=true`);
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

onMounted(() => {
  fetchProducts();

  const handleProductUpdated = () => fetchProducts();
  const handleProductAdded = () => fetchProducts();
  const handleProductDeleted = () => fetchProducts();

  window.addEventListener('product-added', handleProductAdded);
  window.addEventListener('product-updated', handleProductUpdated);
  window.addEventListener('product-deleted', handleProductDeleted);

  onUnmounted(() => {
    window.removeEventListener('product-added', handleProductAdded);
    window.removeEventListener('product-updated', handleProductUpdated);
    window.removeEventListener('product-deleted', handleProductDeleted);
  });
});
</script>

<style scoped>
  .product-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }

  .landing-image-section {
    position: relative;
    height: calc(100vh - 10vh); 
    width: 100%;
    overflow: hidden;
  }

  .landing-image {
    width: 100%;
    height: 100%;
    object-fit: cover; 
  }

  .content-section {
    background-color: #FEFEF6;
    padding: 20px;
    color: #696BE2;
    font-family: 'Inter', sans-serif;
    width: 100%;
  }

  .title {
    font-weight: bold;
    font-size: 32px;
    margin-bottom: 20px;
    text-align: center;
  }

  .intro-text {
    font-size: 24px;
    font-style: italic;
    font-weight: 500;
    margin-bottom: 20px;
    text-align: center;
  }

  .products-section {
    display: flex;
    flex-wrap: wrap;  /* Ajout de flex-wrap pour gérer plusieurs cartes */
    justify-content: center;
    background-color: #FEFEF6; 
    padding: 20px;
    gap: 20px; 
  }

  .product-button {
    background-color: #696BE2;
    color: #FEFEF6;
    font-family: 'Inter', sans-serif;
    font-style: italic;
    font-size: 18px; 
    font-weight: 500;
    padding: 8px 16px; 
    border: none;
    border-radius: 10px;
    cursor: pointer;
    margin-top: 10px;
  }

  .transition-section {
    background-color: #FEFEF6;
    height: 50px;
  }

  .family-meal-section {
    background: linear-gradient(90deg, #1FCDD2 0%, #31D6DC 100%);
    padding: 40px 20px;
  }

  .family-meal-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .family-meal-image {
    max-width: 33%;
    height: auto;
  }

  .family-meal-image.center {
    margin: 0 20px;
    max-width: 60%; 
  }

  .center-content {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .center-button {
    margin-top: 40px; 
  }
</style>