<template>
    <div class="profile-page">
      <h1>Mon Profil</h1>
      <FormComponent
        :fields="fields"
        :formData="user"
        :showEditButton="true"
        :editableFields="editableFields"
        submitButtonText="Mettre à jour"
        @submit="handleSubmit"
      />
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from 'vue';
  import { useAuthStore } from '../stores/authStore';
  import FormComponent from '../components/FormComponent.vue';
  import router from '@/router';
  
  const authStore = useAuthStore();
  const userId = authStore.userId;
  
  const user = ref({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    alertPreferences: [],
  });
  
  const fields = ref([
    { name: 'email', type: 'email', label: 'Email', required: true },
    { name: 'username', type: 'text', label: 'Nom d\'utilisateur', required: true },
    { name: 'firstName', type: 'text', label: 'Prénom', required: true },
    { name: 'lastName', type: 'text', label: 'Nom', required: true },
    { name: 'dateOfBirth', type: 'date', label: 'Date de naissance', required: true },
    { name: 'alertPreferences', type: 'select', label: 'Préférences d\'alerte', required: false, options: [] },
  ]);
  
  const editableFields = ref([
    'alertPreferences',
  ]);
  
  const fetchUserData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}?fields=email,username,firstName,lastName,dateOfBirth,alertPreferences`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }
      const data = await response.json();
      user.value.email = data.email;
      user.value.username = data.username;
      user.value.firstName = data.firstName;
      user.value.lastName = data.lastName;
      user.value.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';
      user.value.alertPreferences = data.alertPreferences || [];
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };
  
  const fetchAlerts = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/alert_types`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        throw new Error('Failed to fetch alert types');
      }
      const data = await response.json();
      fields.value.find(field => field.name === 'alertPreferences').options = data.map(alert => ({
        value: alert.type,
        label: alert.type,
      }));
    } catch (error) {
      console.error('Error fetching alerts:', error);
    }
  };
  
  const handleSubmit = async (formData) => {
    console.log('Submitting form with data:', formData);
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
      const responseData = await response.json();
      console.log('Response data:', responseData);
      alert('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };
  
  onMounted(() => {
    if (authStore.isLoggedIn) {
      fetchUserData();
      fetchAlerts();
    } else {
      router.push({ name: 'Login' });
    }
  });
  </script>
  
  <style scoped>
  .profile-page {
    max-width: 600px;
    margin: auto;
    padding: 1rem;
    background: #f9f9f9;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }
  .profile-page h1 {
    text-align: center;
    margin-bottom: 1rem;
  }
  </style>
  