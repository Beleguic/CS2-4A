<template>
  <div class="profile-page">
    <h1>Mon Profil</h1>
    <FormComponent
      :fields="fields"
      v-model="user"
      submitButtonText="Mettre à jour"
      @submit="handleSubmit"
    />
    <button @click="redirectToForgotPassword" class="action-button">Changer le mot de passe</button>
    
    <h2>Mes Commandes</h2>
    <div v-if="userOrders.length > 0" class="orders-list">
      <div v-for="order in userOrders" :key="order.id" class="order-item">
        <p><strong>Date de création:</strong> {{ order.created_at }}</p>
        <p><strong>Total:</strong> {{ order.total }} €</p>
        <p><strong>Livraison:</strong> {{ order.livraison }}</p>
        <p><strong>Payé:</strong> {{ order.isPayed }}</p>
        <router-link :to="{ name: 'Confirmation', query: { id_order: order.id } }" class="action-button">Voir les détails</router-link>
      </div>
    </div>
    <div v-else>
      <p>Aucune commande trouvée.</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import FormComponent from '../components/FormComponent.vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';

const $toast = useToast();
const authStore = useAuthStore();
const userId = authStore.userId;
const router = useRouter();

const user = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  isSubscribedToNewsletter: false,
});

const userOrders = ref([]);

const fields = ref([
  {
    field: [
      [
        { name: 'email', type: 'email', label: 'Email', required: true },
        { name: 'username', type: 'text', label: "Nom d'utilisateur", required: true }
      ],
      [
        { name: 'firstName', type: 'text', label: 'Prénom', required: true },
        { name: 'lastName', type: 'text', label: 'Nom', required: true }
      ],
      [
        { name: 'dateOfBirth', type: 'date', label: 'Date de naissance', required: true },
      ],
      [
        { name: 'isSubscribedToNewsletter', type: 'checkbox', label: 'Inscription Newsletter', required: false }
      ]
    ]
  }
]);

const fetchUserData = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
    const data = await response.json();
    console.log('User data:', data);
    user.value.email = data.email;
    user.value.username = data.username;
    user.value.firstName = data.firstName;
    user.value.lastName = data.lastName;
    user.value.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';
    user.value.isSubscribedToNewsletter = data.isSubscribedToNewsletter || false;
  } catch (error) {
    console.error('Error fetching user data:', error);
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    }); 
  }
};


const fetchUserOrders = async () => {
  try {
    console.log('Fetching user orders for userId:', userId);
    const response = await fetch(`${import.meta.env.VITE_API_URL}/orders?userId=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (!response.ok) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      }); 
      return;
    }
    const data = await response.json();
    userOrders.value = data.map(order => ({
      ...order,
      created_at: new Date(order.created_at).toLocaleString('fr-FR'),
      isPayed: order.isPayed ? 'Oui' : 'Non'
    }));
  } catch (error) {
    $toast.open({
      message: 'Erreur! Veuillez recommencer!',
      type: 'error',
      position: 'bottom-left',
    }); 
  }
};

const handleSubmit = async (formData) => {
  console.log('Submitting form data:', formData);
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify(formData)
    });
    if (!response.ok) {
      throw new Error('Failed to update profile');
    }
    $toast.open({
      message: 'Votre profil a été modifié !',
      type: 'success',
      position: 'bottom-left',
    });
  } catch (error) {
    console.error('Error during profile update:', error);
    $toast.open({
      message: 'Erreur! Veuillez recommencer! !',
      type: 'error',
      position: 'bottom-left',
    });
  }
};

const redirectToForgotPassword = () => {
  router.push({ name: 'ForgotPassword' });
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchUserData();
    fetchUserOrders();
  } else {
    router.push({ name: 'Login' });
  }
});
</script>

<style scoped>
.profile-page {
  max-width: 800px;
  margin: auto;
  padding: 1rem;
  background: #f9f9f9;
  border-radius: 8px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
}
.profile-page h1, .profile-page h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.orders-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}
.order-item {
  padding: 1rem;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 0 5px rgba(0, 0, 0, 0.1);
}
.order-item p {
  margin: 0.5rem 0;
}
.profile-page button, .action-button {
  display: block;
  width: 100%;
  padding: 0.75rem;
  background: #696BE2;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s;
  margin-top: 1rem;
  text-align: center;
  text-decoration: none;
}
.profile-page button:hover, .action-button:hover {
  background: #5756A1;
}
</style>
