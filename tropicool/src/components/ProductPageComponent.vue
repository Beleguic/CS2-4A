<template>
    <div class="product-page">
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
  </template>
  
  <script>
  export default {
    data() {
      return {
        product: {},
        quantity: 1,
      };
    },
    computed: {
      totalPrice() {
        return this.product.price * this.quantity;
      },
    },
    methods: {
      fetchProduct() {
        const productId = this.$route.params.id;
        const apiUrl = import.meta.env.VITE_API_URL;
        fetch(`${apiUrl}/product/${productId}`)
          .then(response => response.json())
          .then(data => {
            this.product = data;
          })
          .catch(error => {
            console.error('Error fetching product:', error);
          });
      },
      addToFridge() {
        console.log(`Product ${this.product.name} added to fridge`);
      },
      increaseQuantity() {
        this.quantity += 1;
      },
      decreaseQuantity() {
        if (this.quantity > 1) {
          this.quantity -= 1;
        }
      },
    },
    mounted() {
      this.fetchProduct();
    },
  };
  </script>
  
  <style scoped>
  body {
    background-color: #FEFEF6;
    margin: 0;
    font-family: Arial, sans-serif;
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
    width: 100%;
    min-height: 600px; /* Increase the minimum height */
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
  </style>
  