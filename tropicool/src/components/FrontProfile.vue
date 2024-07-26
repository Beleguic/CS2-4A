<template>
  <section class="w-full p-4 bg-gray-100 shadow-xl grid gap-8">
    <h1 class="font-bold text-xl">Mon Profil</h1>
    <FormComponent 
      :fields="fields"
      :modelValue="user"
      submitButtonText="Mettre à jour"
      @submit="handleSubmit" />
    <router-link :to="{ name: 'ForgotPassword' }">Changer mon mot de passe</router-link>
  </section>
</template>

<script setup lang="ts">
  interface User {
    email: string;
    username: string;
    firstName: string;
    lastName: string;
    dateOfBirth: string;
    isSubscribedToNewsletter: boolean;
  }

  import { ref, onMounted } from 'vue';
  import { useRouter } from 'vue-router';
  import { useAuthStore } from '../stores/authStore';
  import FormComponent from '../components/FormComponent.vue';
  import { useToast } from 'vue-toast-notification';

  const $toast = useToast();
  const authStore = useAuthStore();
  const userId = authStore.userId;
  const token = localStorage.getItem('token');
  const apiUrl = import.meta.env.VITE_API_URL;

  const user = ref<User>({
    email: '',
    username: '',
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    isSubscribedToNewsletter: false,
  });

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
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
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

      user.value.email = data.email;
      user.value.username = data.username;
      user.value.firstName = data.firstName;
      user.value.lastName = data.lastName;
      user.value.dateOfBirth = data.dateOfBirth ? new Date(data.dateOfBirth).toISOString().split('T')[0] : '';
      user.value.isSubscribedToNewsletter = data.isSubscribedToNewsletter || false;
    //   userAlerts.value = data.alerts.map(alert => ({
    //   ...alert,
    //   created_at: new Date(alert.created_at).toLocaleString('fr-FR'),
    //   alertType: {
    //     type: alert.alertType?.type || ''
    //   },
    //   product: {
    //     name: alert.product?.name || ''
    //   },
    //   category: {
    //     name: alert.category?.name || ''
    //   }
    // }));
    // console.log('userAlerts:', userAlerts.value);
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  };

  // const handleDeleteAlert = async (id) => {
  //   try {
  //     const response = await fetch(`${import.meta.env.VITE_API_URL}/alert/${id}`, {
  //       method: 'DELETE',
  //       headers: {
  //         'Authorization': `Bearer ${localStorage.getItem('token')}`
  //       }
  //     });
  //     if (response.status === 204) {
  //       userAlerts.value = userAlerts.value.filter(alert => alert.id !== id);
  //       alert('Alerte supprimée avec succès');
  //     } else {
  //       throw new Error('Failed to delete alert');
  //     }
  //   } catch (error) {
  //     console.error('Error deleting alert:', error);
  //     alert('Failed to delete alert');
  //   }
  // };

  const handleSubmit = async (formData: User) => {
    try {
      const { ...payload } = formData;
      
      const response = await fetch(`${apiUrl}/users/${userId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.status === 200) {
        $toast.open({
          message: 'Votre profil a été modifié !',
          type: 'success',
          position: 'bottom-left',
        });
      } else {
        $toast.open({
          message: 'Erreur! Veuillez recommencer!',
          type: 'error',
          position: 'bottom-left',
        });
      }
    } catch (error) {
      $toast.open({
        message: 'Erreur! Veuillez recommencer!',
        type: 'error',
        position: 'bottom-left',
      });
    }
  };

  onMounted(() => {
    if (authStore.isLoggedIn) {
      fetchUserData();
    } else {
      const router = useRouter();
      router.push({ name: 'Login' });
    }
  });
</script>