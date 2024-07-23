<template>
    <div class="alert-management">
      <h1>Gérer les alertes</h1>
      <form @submit.prevent="handleSubmit">
        <div>
          <label for="alertType">Type d'alerte</label>
          <select v-model="formData.alert_type_id" id="alertType">
            <option v-for="type in alertTypes" :key="type.id" :value="type.id">{{ type.type }}</option>
          </select>
        </div>
        <div>
          <label for="product">Produit</label>
          <select v-model="formData.product_id" id="product">
            <option value="">-- Sélectionnez un produit --</option>
            <option v-for="product in products" :key="product.id" :value="product.id">{{ product.name }}</option>
          </select>
        </div>
        <div>
          <label for="category">Catégorie</label>
          <select v-model="formData.category_id" id="category">
            <option value="">-- Sélectionnez une catégorie --</option>
            <option v-for="category in categories" :key="category.id" :value="category.id">{{ category.name }}</option>
          </select>
        </div>
        <button type="submit">Ajouter une alerte</button>
      </form>
    </div>
</template>
  
<script setup>
  import { ref, onMounted } from 'vue';
  import axios from 'axios';
  import { useToast } from 'vue-toast-notification';

  const $toast = useToast();
  const formData = ref({
    alert_type_id: null,
    product_id: '',
    category_id: ''
  });
  
  const alertTypes = ref([]);
  const products = ref([]);
  const categories = ref([]);
  
  const fetchAlertTypes = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/alert_types`);
      alertTypes.value = response.data;
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
    }
  };
  
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/product/list`);
      products.value = response.data;
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
    }
  };
  
  const fetchCategories = async () => {
    try {
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/category/list`);
      categories.value = response.data;
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
    }
  };
  
  const handleSubmit = async () => {
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/alert/new`, formData.value, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      $toast.open({
        message: 'Alerte ajoutée avec succès!',
        type: 'success',
        position: 'bottom-left',
      }); 
    } catch (error) {
      console.error('Error adding alert:', error);
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
    }
  };
  
  onMounted(() => {
    fetchAlertTypes();
    fetchProducts();
    fetchCategories();
  });
  </script>
  
  <style scoped>
  .alert-management {
    max-width: 600px;
    margin: auto;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .alert-management h1 {
    text-align: center;
    margin-bottom: 1rem;
  }
  .alert-management form div {
    margin-bottom: 1rem;
  }
  .alert-management form label {
    display: block;
    margin-bottom: 0.5rem;
  }
  .alert-management form select {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  .alert-management form button {
    display: block;
    width: 100%;
    padding: 0.75rem;
    background: #696BE2;
    color: #fff;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background 0.3s;
  }
  .alert-management form button:hover {
    background: #5756A1;
  }
  </style>
  