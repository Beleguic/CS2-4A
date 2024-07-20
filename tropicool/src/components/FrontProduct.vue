<template>
  <div class="product-container">
    <!-- Section Image -->
    <section class="landing-image-section">
      <img src="/landingproduct.jpg" alt="Landing Product" class="landing-image" />
    </section>

    <!-- Section Contenu -->
    <section class="content-section">
      <h1 class="title">Découvrez nos produits TROUPICOOL !!</h1>
      <p class="intro-text">Des produits de qualité pour des moments inoubliables</p>
    </section>

    <!-- Section Recherche et Tri -->
    <section class="search-sort-section">
      <input type="text" v-model="searchQuery" placeholder="Rechercher un produit..." @input="fetchProducts" class="search-input" />
      <select v-model="sortOption" @change="fetchProducts" class="sort-select">
        <option value="">Trier par</option>
        <option value="price_asc">Prix croissant</option>
        <option value="price_desc">Prix décroissant</option>
      </select>
      <select v-model="priceRange" @change="fetchProducts" class="price-select">
        <option value="">Tous les prix</option>
        <option value="0-10">Moins de 10€</option>
        <option value="10-25">Entre 10€ et 25€</option>
        <option value="25+">Plus de 25€</option>
      </select>
    </section>

    <!-- Section Produits -->
    <section class="products-section">
      <ProductCardComponent v-for="product in filteredProducts" :key="product.id" :product="product" />
    </section>

    <!-- Section Family Meal -->
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
import { ref, computed, onMounted, onUnmounted } from 'vue';
import axios from 'axios';
import ProductCardComponent from '../components/ProductCardComponent.vue';

const products = ref([]);
const searchQuery = ref('');
const sortOption = ref('');
const priceRange = ref('');
const apiUrl = import.meta.env.VITE_API_URL;

const fetchProducts = async () => {
  try {
    const params = new URLSearchParams({
      frontend: 'true',
      search: searchQuery.value,
      sort: sortOption.value,
      priceRange: priceRange.value,
    });
    const response = await axios.get(`${apiUrl}/product`, { params });
    products.value = response.data;
  } catch (error) {
    console.error('Error fetching products:', error);
  }
};

const filteredProducts = computed(() => {
  return products.value.filter(product => {
    let matchesSearch = true;
    let matchesPrice = true;

    if (searchQuery.value) {
      matchesSearch = product.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                      product.description.toLowerCase().includes(searchQuery.value.toLowerCase());
    }

    if (priceRange.value) {
      if (priceRange.value === '0-10') {
        matchesPrice = product.price < 10;
      } else if (priceRange.value === '10-25') {
        matchesPrice = product.price >= 10 && product.price <= 25;
      } else if (priceRange.value === '25+') {
        matchesPrice = product.price > 25;
      }
    }

    return matchesSearch && matchesPrice;
  }).sort((a, b) => {
    if (sortOption.value === 'price_asc') {
      return a.price - b.price;
    } else if (sortOption.value === 'price_desc') {
      return b.price - a.price;
    }
    return 0;
  });
});

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

.search-sort-section {
  display: flex;
  justify-content: center;
  gap: 10px;
  padding: 20px;
  background-color: #FEFEF6;
  border-bottom: 1px solid #ccc; /* Pour séparer visuellement de l'image */
}

.search-input, .sort-select, .price-select {
  padding: 10px;
  font-size: 16px;
  background-color: #f0f0f0; /* Couleur de fond plus claire */
  border: 1px solid #ccc; /* Couleur de bordure */
  border-radius: 5px; /* Coins arrondis */
  color: #333; /* Couleur du texte plus foncée pour le contraste */
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
