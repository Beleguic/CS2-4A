<template>
  <div class="product-page" v-if="isAllowed">
    <div class="product-container">
      <div class="product-image">
        <img :src="getImageUrl(product.image)" alt="product image" class="product-image"/>
      </div>
      <div class="product-details">
        <h1 class="product-name">{{ product.name }}</h1>
        <p class="product-description">{{ product.description }}</p>
        <AddToCart :item="product.id" :price="product.price" />

        <div v-if="alertTypes.length > 0" class="alert-preferences">
          <h2>Préférences d'Alerte</h2>
          <form @submit.prevent="saveAlertPreferences">
            <div v-for="alertType in alertTypes" :key="alertType.id">
              <label>
                <input type="checkbox" :value="alertType.id" v-model="selectedAlerts" />
                {{ alertType.type }}
              </label>
            </div>
            <button type="submit">Sauvegarder les alertes</button>
          </form>
        </div>

        <p v-if="product.is_adult" class="alcohol-warning">Contient de l'alcool. À consommer avec modération.</p>
      </div>
    </div>
  </div>
  <div v-else class="access-denied">
    <p class="main-message">Vous devez être majeur pour accéder à cette page.</p>
    <p class="secondary-message">
      Vous aurez toute la vie pour savourer et partager des moments festifs avec modération grâce à nos alcools Troupicool !
      N'hésitez pas à essayer nos produits sans alcool, car sans alcool, la fête est encore plus folle !
    </p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useAuthStore } from '@/stores/authStore';
import { useRouter } from 'vue-router';
import AddToCart from './AddToCart.vue';

const authStore = useAuthStore();
const userId = authStore.userId;

const product = ref({
  id: '',
  price: 0,
  name: '',
  description: '',
  image: '',
  is_adult: false
});
const isAllowed = ref(true);
const alertTypes = ref([]);
const selectedAlerts = ref([]);
const initialAlerts = ref([]); // Store the initial alerts with UUIDs
const router = useRouter();

const fetchProduct = async () => {
  const productId = router.currentRoute.value.params.id;
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/product/${productId}?frontend=true`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const data = await response.json();
    product.value = data;
    if (data.is_adult) {
      checkAge();
    }
    await fetchAlertTypes();
    await fetchUserAlerts(); // Fetch user alerts without product ID
  } catch (error) {
    console.error('Error fetching product:', error);
  }
};

const fetchAlertTypes = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/alert_types`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    alertTypes.value = await response.json();
  } catch (error) {
    console.error('Error fetching alert types:', error);
  }
};

const fetchUserAlerts = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;
  try {
    const response = await fetch(`${apiUrl}/alert?user_id=${userId}`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    const userAlerts = await response.json();

    // Filter alerts by product ID
    const productAlerts = userAlerts.filter(alert => alert.product_id === product.value.id);

    selectedAlerts.value = productAlerts.map(alert => alert.alert_type_id);
    initialAlerts.value = productAlerts.map(alert => ({ alert_type_id: alert.alert_type_id, id: alert.id })); // Copy initial selected alerts with IDs
  } catch (error) {
    console.error('Error fetching user alerts:', error);
  }
};

const saveAlertPreferences = async () => {
  const apiUrl = import.meta.env.VITE_API_URL;

  // Find alerts to be deleted
  const alertsToDelete = initialAlerts.value.filter(alert => !selectedAlerts.value.includes(alert.alert_type_id));
  // Find alerts to be added
  const alertsToAdd = selectedAlerts.value.filter(alertTypeId => !initialAlerts.value.some(alert => alert.alert_type_id === alertTypeId));

  // Add new alerts
  for (const alertTypeId of alertsToAdd) {
    const alert = {
      alert_type_id: String(alertTypeId),
      user_id: String(authStore.userId),
      product_id: String(product.value.id),
      category_id: null, // If needed, add logic for category_id
    };

    try {
      const response = await fetch(`${apiUrl}/alert/new`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(alert)
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde des alertes');
      }
    } catch (error) {
      console.error('Error saving alert preferences:', error);
      alert(error.message);
      return; // Stop processing if there is an error
    }
  }

  // Delete deselected alerts
  for (const alert of alertsToDelete) {
    try {
      const response = await fetch(`${apiUrl}/alert/${alert.id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la suppression des alertes');
      }
    } catch (error) {
      console.error('Error deleting alert preferences:', error);
      alert(error.message);
      return; // Stop processing if there is an error
    }
  }

  alert('Alertes mises à jour avec succès');
  initialAlerts.value = selectedAlerts.value.map(alertTypeId => {
    const alert = initialAlerts.value.find(a => a.alert_type_id === alertTypeId);
    return { alert_type_id: alertTypeId, id: alert ? alert.id : null };
  }); // Update initial alerts to reflect current state
};

const checkAge = async () => {
  if (authStore.userId) {
    const apiUrl = import.meta.env.VITE_API_URL;
    try {
      const response = await fetch(`${apiUrl}/users/${authStore.userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });
      const user = await response.json();
      console.log('User data:', user);
      const age = calculateAge(new Date(user.dateOfBirth));
      console.log('User age:', age);
      if (age < 18) {
        isAllowed.value = false;
        console.log('Accès refusé : Utilisateur non majeur.');
      } else {
        isAllowed.value = true;
        console.log('Accès autorisé : Utilisateur majeur.');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      isAllowed.value = false;
    }
  } else {
    isAllowed.value = false;
    console.log('Accès refusé : Aucun ID utilisateur trouvé.');
  }
};

const calculateAge = (birthdate) => {
  const today = new Date();
  let age = today.getFullYear() - birthdate.getFullYear();
  const monthDifference = today.getMonth() - birthdate.getMonth();
  if (monthDifference < 0 || (monthDifference === 0 && today.getDate() < birthdate.getDate())) {
    age--;
  }
  console.log('Calculated age:', age);
  return age;
};

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

onMounted(() => {
  fetchProduct();
});
</script>

<style scoped>
body {
  background-color: #FEFEF6;
  margin: 0;
  font-family: Arial, sans-serif;
}

.page-container {
  background-color: #FEFEF6;
  min-height: 100vh;
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
  width: 80%;
  min-height: 600px;
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

.age-verification {
  font-size: 20px;
  color: red;
  margin-bottom: 30px;
}

.verify-age-button {
  background-color: #696BE2;
  color: #FEFEF6;
  font-size: 18px;
  font-weight: 500;
  padding: 10px 20px;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  transition: background-color 0.3s;
}

.verify-age-button:hover {
  background-color: #5756A1;
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

.access-denied {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px;
  background-color: #FEFEF6;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  text-align: center;
  font-size: 24px;
  color: red;
}

.access-denied .main-message {
  font-size: 24px;
  font-weight: bold;
  margin-bottom: 20px;
}

.access-denied .secondary-message {
  font-size: 18px;
  line-height: 1.5;
  max-width: 800px;
}
</style>
