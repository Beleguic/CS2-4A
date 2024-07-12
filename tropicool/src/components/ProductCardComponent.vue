<template>
  <div class="product-card">
    <img :src="product.image" alt="Product Image" class="product-image" />
    <h3 class="product-name">{{ product.name }}</h3>
    <p class="product-price">{{ product.price }} €</p>
    <p v-if="product.is_adult" class="alcohol-warning">Contient de l'alcool. À consommer avec modération.</p>
    <router-link :to="{ name: 'ProductPage', params: { id: product.id } }" class="add-to-cart-button">
      <img src="/Iconfrigo.png" alt="Cart Icon" class="cart-icon" />
      Ajouter au frigo
    </router-link>
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
}

.product-image {
  width: 100%;
  height: auto;
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
