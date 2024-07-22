<template>
  <div class="product-card">
    <img :src="getImageUrl(product.image)" alt="Product Image" class="product-image" />
    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-price">{{ product.price }} €</p>
    <p v-if="product.is_adult" class="alcohol-warning">Contient de l'alcool. À consommer avec modération.</p>
    <div class="button-container">
      <router-link :to="{ name: 'ProductPage', params: { id: product.name } }" class="add-to-cart-button">
        <img src="/Iconfrigo.png" alt="Cart Icon" class="cart-icon" />
        Voir le produit
      </router-link>  
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue';

const props = defineProps({
  product: {
    type: Object,
    required: true
  }
});

const getImageUrl = (path) => {
  const baseUrl = import.meta.env.VITE_API_URL;
  let relativePath = path;

  if (!path) {
    console.error('Path is undefined or null');
    return '';
  }

  // Enlever le chemin de base s'il est déjà présent
  if (path.startsWith(baseUrl)) {
    relativePath = path.replace(baseUrl, '');
  }

  // Enlever la partie spécifique au système de fichiers pour obtenir un chemin relatif
  relativePath = relativePath.replace('/home/node/app', '');

  // Ajouter une barre oblique initiale si elle est absente
  if (!relativePath.startsWith('/')) {
    relativePath = `/${relativePath}`;
  }

  // Construire l'URL complète
  const imageUrl = `${baseUrl}${relativePath}`;
  
  console.log('Image URL:', imageUrl); // Log de l'URL de l'image
  return imageUrl;
};
</script>

<style scoped>
.product-card {
  background-color: #FEFEF6;
  border: 1px solid #696BE2;
  border-radius: 10px;
  padding: 20px;
  text-align: center;
  width: 300px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
}

.product-image {
  width: 100%;
  height: 200px; /* Ajustez cette valeur selon vos besoins */
  object-fit: contain; /* Cette propriété permet de réduire l'image sans la couper */
  border-radius: 10px;
}

.product-name {
  font-size: 24px;
  font-weight: bold;
  color: #696BE2;
  margin: 15px 0 10px;
}

.product-price {
  font-size: 20px;
  font-weight: 500;
  color: #1D1F96;
  margin-bottom: 20px;
}

.alcohol-warning {
  color: red;
  font-size: 12px;
  margin-bottom: 10px;
}

.button-container {
  margin-top: auto;
}

.add-to-cart-button {
  background-color: #696BE2;
  color: #FEFEF6;
  font-size: 18px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: auto;
  transition: background-color 0.3s;
}

.add-to-cart-button:hover {
  background-color: #5756A1;
}

.cart-icon {
  width: 30px;
  height: 30px;
}

.error-message {
  color: red;
  font-size: 12px;
  margin-top: 10px;
}
</style>

