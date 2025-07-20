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
    
    <!-- Section Export des Données Personnelles (RGPD) -->
    <div class="data-export-section">
      <h2>📊 Mes Données Personnelles</h2>
      <div class="export-info">
        <p>
          Conformément au RGPD, vous avez le droit de télécharger toutes vos données personnelles 
          stockées sur Tropicool. Cette fonctionnalité vous permet d'exporter vos informations 
          au format JSON ou CSV.
        </p>
      </div>
      
      <div class="export-actions">
        <button 
          @click="exportUserData" 
          :disabled="isExporting"
          class="export-btn export-btn-primary"
        >
          <span v-if="isExporting" class="loading-spinner"></span>
          {{ isExporting ? 'Génération en cours...' : '📥 Exporter mes Données' }}
        </button>
        
        <div v-if="exportStatus" class="export-status">
          <div class="status-indicator" :class="{ success: exportStatus.success }">
            <span class="status-dot"></span>
            <span class="status-text">{{ exportStatus.message }}</span>
          </div>
          
          <div v-if="exportStatus.success && exportStatus.files" class="download-links">
            <a 
              :href="exportStatus.files.json" 
              class="download-link"
              target="_blank"
            >
              📄 Télécharger JSON
            </a>
            <a 
              :href="exportStatus.files.csv" 
              class="download-link"
              target="_blank"
            >
              📊 Télécharger CSV
            </a>
          </div>
          
          <div v-if="exportStatus.dataSummary" class="data-summary">
            <h4>Résumé de vos données :</h4>
            <ul>
              <li>📧 Email : {{ exportStatus.dataSummary.user.email }}</li>
              <li>👤 Nom d'utilisateur : {{ exportStatus.dataSummary.user.username }}</li>
              <li>🛒 Commandes : {{ exportStatus.dataSummary.ordersCount }}</li>
              <li>🔔 Alertes : {{ exportStatus.dataSummary.alertsCount }}</li>
              <li>🛍️ Articles dans le panier : {{ exportStatus.dataSummary.cartItemsCount }}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
    
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

const user = ref({
  email: '',
  username: '',
  firstName: '',
  lastName: '',
  dateOfBirth: '',
  isSubscribedToNewsletter: false,
});

const userOrders = ref([]);
const isExporting = ref(false);
const exportStatus = ref(null);

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
  } catch (error) {
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
    const response = await fetch(`${import.meta.env.VITE_API_URL}/order?userId=${userId}`, {
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
    $toast.open({
      message: 'Erreur! Veuillez recommencer! !',
      type: 'error',
      position: 'bottom-left',
    });
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
      $toast.open({
        message: 'Alerte supprimée avec succès',
        type: 'error',
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

// Fonction pour exporter les données utilisateur
const exportUserData = async () => {
  isExporting.value = true;
  exportStatus.value = null;
  
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}/export`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    
    const data = await response.json();
    
    if (response.ok && data.success) {
      exportStatus.value = {
        success: true,
        message: 'Export généré avec succès ! Vous pouvez maintenant télécharger vos données.',
        files: data.files,
        dataSummary: data.dataSummary
      };
      
      $toast.open({
        message: 'Export de données généré avec succès',
        type: 'success',
        position: 'bottom-left',
        duration: 5000
      });
    } else {
      throw new Error(data.error || 'Erreur lors de l\'export');
    }
  } catch (error) {
    console.error('Erreur lors de l\'export:', error);
    
    exportStatus.value = {
      success: false,
      message: error.message || 'Erreur lors de la génération de l\'export'
    };
    
    $toast.open({
      message: 'Erreur lors de l\'export des données',
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    });
  } finally {
    isExporting.value = false;
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

/* Styles pour la section d'export des données */
.data-export-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  border: 1px solid #e9ecef;
}

.data-export-section h2 {
  color: #1D1F96;
  margin-bottom: 1rem;
  text-align: left;
}

.export-info {
  margin-bottom: 1.5rem;
}

.export-info p {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.export-actions {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.export-btn {
  padding: 0.875rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  min-width: 200px;
}

.export-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.export-btn-primary {
  background: #28a745;
  color: white;
}

.export-btn-primary:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-1px);
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.export-status {
  background: white;
  border-radius: 6px;
  padding: 1rem;
  border: 1px solid #e9ecef;
}

.status-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dc3545;
  transition: background 0.3s ease;
}

.status-indicator.success .status-dot {
  background: #28a745;
}

.status-text {
  font-weight: 600;
  color: #333;
}

.download-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.download-link {
  padding: 0.5rem 1rem;
  background: #696BE2;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  font-size: 0.875rem;
  transition: background 0.3s ease;
}

.download-link:hover {
  background: #5a5cd1;
  text-decoration: none;
  color: white;
}

.data-summary {
  background: #f8f9fa;
  border-radius: 4px;
  padding: 1rem;
}

.data-summary h4 {
  color: #1D1F96;
  margin-bottom: 0.75rem;
  font-size: 1rem;
}

.data-summary ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.data-summary li {
  padding: 0.25rem 0;
  color: #666;
  font-size: 0.9rem;
}

/* Responsive */
@media (max-width: 768px) {
  .download-links {
    flex-direction: column;
  }
  
  .download-link {
    text-align: center;
  }
  
  .export-btn {
    width: 100%;
  }
}
</style>
