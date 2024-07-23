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
    <div class="w-full max-w-7xl mx-auto py-4">
      <div class="profile-view">
        <form @submit.prevent="deleteAccount">
          <div class="form-group">
            <label for="rgpdCheckbox">
              <input type="checkbox" id="rgpdCheckbox" v-model="rgpdChecked" />
              J'accepte que mes données soient anonymisées conformément à la politique de confidentialité suite à la suppression de mon compte effective dans 90 jours. 
              <a href="/privacy-policy" class="link">En savoir plus.</a>
            </label>
          </div>
          <button type="submit" :disabled="!rgpdChecked">Supprimer mon compte</button>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '../stores/authStore';
import FormComponent from '../components/FormComponent.vue';
import TableComponent from '../components/TableComponent.vue';
import router from '@/router';

const authStore = useAuthStore();
const userId = authStore.userId;

const user = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  isSubscribedToNewsletter: false,
});

const alertColumns = [
  { key: 'alertType.type', label: 'Type d\'alerte' },
  { key: 'product.name', label: 'Produit' },
  { key: 'category.name', label: 'Catégorie' },
  { key: 'created_at', label: 'Créé le' },
  { key: 'actions', label: 'Actions' }
];

const userAlerts = ref([]);

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

const rgpdChecked = ref(false);

const fetchUserData = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
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
    user.value.isSubscribedToNewsletter = data.isSubscribedToNewsletter || false;
    userAlerts.value = data.alerts.map(alert => ({
      ...alert,
      created_at: new Date(alert.created_at).toLocaleString('fr-FR'),
      alertType: {
        type: alert.alertType?.type || ''
      },
      product: {
        name: alert.product?.name || ''
      },
      category: {
        name: alert.category?.name || ''
      }
    }));
    console.log('userAlerts:', userAlerts.value);
  } catch (error) {
    console.error('Error fetching user data:', error);
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
    alert('Profile updated successfully');
  } catch (error) {
    console.error('Error updating profile:', error);
    alert('Failed to update profile');
  }
};

const handleDeleteAlert = async (id) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/alert/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    if (response.status === 204) {
      userAlerts.value = userAlerts.value.filter(alert => alert.id !== id);
      alert('Alerte supprimée avec succès');
    } else {
      throw new Error('Failed to delete alert');
    }
  } catch (error) {
    console.error('Error deleting alert:', error);
    alert('Failed to delete alert');
  }
};

const deleteAccount = async () => {
  if (!rgpdChecked.value) {
    alert("Veuillez accepter la politique de confidentialité pour continuer.");
    return;
  }
  
  if (confirm("Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.")) {
    try {
      // Anonymize and request account deletion
      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/anonymize-and-request-deletion/${userId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        credentials: 'include' // Assurez-vous que les credentials sont inclus
      });

      if (!response.ok) {
        const message = await response.text();
        throw new Error(message || 'Failed to request account deletion');
      }

      alert('Votre compte a été anonymisé et sera supprimé dans 90 jours.');
      router.push('/'); // Redirect to home page or sign-in page
    } catch (error) {
      console.error('Erreur lors de la suppression du compte:', error);
      alert(error.message || 'Erreur lors de la suppression du compte.');
    }
  }
};


const redirectToForgotPassword = () => {
  router.push({ name: 'ForgotPassword' });
};

onMounted(() => {
  if (authStore.isLoggedIn) {
    fetchUserData();
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
.profile-page h1, .profile-page h2 {
  text-align: center;
  margin-bottom: 1rem;
}
.profile-page button {
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
}
.profile-page button:hover {
  background: #5756A1;
}
.profile-view {
  margin: auto;
  width: 50%;
  padding: 20px;
  box-shadow: 0 0 10px rgba(0,0,0,0.1);
}
.form-group {
  margin-bottom: 20px;
}
button {
  background-color: #f44336; /* Red */
  color: white;
  border: none;
  padding: 10px 20px;
  text-align: center;
  text-decoration: none;
  display: inline-block;
  font-size: 16px;
  cursor: pointer;
}
button:disabled {
  background-color: #ccc;
}
.link {
  color: #1E90FF; /* Bleu comme un lien */
  text-decoration: underline;
  cursor: pointer;
}
.link:hover {
  color: #104E8B; /* Bleu plus foncé au survol */
}
</style>
