<template>
    <div class="product-container">
      <section class="landing-image-section">
        <img src="/landingproduct.png" alt="Landing Product" class="landing-image" />
      </section>
      <section class="content-section">
        <h1 class="title">Découvrez nos produits TROUPICOOL !!</h1>
        <p class="intro-text">Des produits de qualité pour des moments inoubliables</p>
      </section>
      <section class="products-section">
        <ProductCardComponent v-for="product in products" :key="product.id" :product="product" />
      </section>
      <section class="transition-section"></section> 
    </div>
  </template>
  
  <script setup>
  import ProductCardComponent from '../components/ProductCardComponent.vue';
  
  const products = [
    { id: 1, name: 'Produit 1', price: 19.99, image: '/path/to/image1.png' },
    { id: 2, name: 'Produit 2', price: 29.99, image: '/path/to/image2.png' }
  ];
  </script>
  
  <style scoped>
  .product-container {
    display: flex;
    flex-direction: column;
    min-height: 100vh;
  }
  
  .landing-image-section {
    position: relative;
    height: calc(100vh - 10vh); /* 100vh - 10vh de la navbar */
    width: 100vw;
    overflow: hidden;
    margin-top: -10px;
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
    justify-content: center;
    background-color: #FEFEF6; 
    padding: 20px;
    gap: 20px; 
  }
  
  .transition-section {
    background-color: #FEFEF6;
    height: 50px;
  }
  </style>
  