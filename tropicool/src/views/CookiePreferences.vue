<template>
  <div class="cookie-preferences-container">
    <div class="cookie-preferences-content">
      <div class="cookie-header">
        <h1 class="cookie-title">🍪 Gestion des Préférences Cookies</h1>
        <p class="cookie-description">
          Gérez vos préférences de cookies pour personnaliser votre expérience sur Tropicool.
          Vous pouvez modifier ces paramètres à tout moment.
        </p>
      </div>

      <div class="cookie-status">
        <div class="status-indicator" :class="{ active: cookieStore.hasConsent }">
          <span class="status-dot"></span>
          <span class="status-text">
            {{ cookieStore.hasConsent ? 'Consentement enregistré' : 'Aucun consentement' }}
          </span>
        </div>
        <p class="status-date" v-if="lastUpdated">
          Dernière mise à jour : {{ formatDate(lastUpdated) }}
        </p>
      </div>

      <div class="cookie-options">
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
              <input 
                type="checkbox" 
                v-model="localPreferences.essential" 
                disabled 
                checked
              />
              <span class="checkmark"></span>
              <strong>Cookies Essentiels</strong>
            </label>
            <span class="cookie-required">(Obligatoires)</span>
          </div>
          <p class="cookie-category-description">
            Ces cookies sont nécessaires au fonctionnement du site (authentification, panier, sécurité).
            Ils ne peuvent pas être désactivés.
          </p>
        </div>

        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
              <input 
                type="checkbox" 
                v-model="localPreferences.analytics"
              />
              <span class="checkmark"></span>
              <strong>Cookies Analytics</strong>
            </label>
          </div>
          <p class="cookie-category-description">
            Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
            Ces données sont anonymisées et ne permettent pas de vous identifier personnellement.
          </p>
        </div>

        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
              <input 
                type="checkbox" 
                v-model="localPreferences.marketing"
              />
              <span class="checkmark"></span>
              <strong>Cookies Marketing</strong>
            </label>
          </div>
          <p class="cookie-category-description">
            Permettent de vous proposer des offres personnalisées et de mesurer l'efficacité de nos campagnes.
            Ces cookies peuvent être utilisés pour vous cibler sur d'autres sites.
          </p>
        </div>
      </div>

      <div class="cookie-actions">
        <button 
          @click="savePreferences" 
          :disabled="isSaving"
          class="cookie-btn cookie-btn-primary"
        >
          <span v-if="isSaving" class="loading-spinner"></span>
          {{ isSaving ? 'Sauvegarde...' : 'Sauvegarder les Préférences' }}
        </button>
        
        <button 
          @click="acceptAll" 
          :disabled="isSaving"
          class="cookie-btn cookie-btn-secondary"
        >
          Accepter Tout
        </button>
        
        <button 
          @click="rejectAll" 
          :disabled="isSaving"
          class="cookie-btn cookie-btn-reject"
        >
          Refuser Tout
        </button>
      </div>

      <div class="cookie-info">
        <h3>Informations Complémentaires</h3>
        <div class="info-grid">
          <div class="info-item">
            <h4>Comment supprimer les cookies ?</h4>
            <p>Vous pouvez supprimer les cookies existants via les paramètres de votre navigateur. 
            Consultez l'aide de votre navigateur pour plus d'informations.</p>
          </div>
          
          <div class="info-item">
            <h4>Impact sur l'expérience</h4>
            <p>Désactiver certains cookies peut affecter le fonctionnement du site. 
            Les cookies essentiels restent toujours actifs pour assurer la sécurité.</p>
          </div>
          
          <div class="info-item">
            <h4>Droit à l'oubli</h4>
            <p>Vous pouvez demander la suppression de vos données personnelles, 
            y compris vos préférences de cookies, en nous contactant.</p>
          </div>
        </div>
      </div>

      <div class="cookie-links">
        <router-link to="/privacy-policy" class="cookie-link">
          Politique de Confidentialité
        </router-link>
        <router-link to="/conditions-generales-dutilisation" class="cookie-link">
          Conditions Générales d'Utilisation
        </router-link>
        <a href="mailto:team.troupicool@outlook.fr" class="cookie-link">
          Nous Contacter
        </a>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useCookieStore } from '@/stores/cookieStore';
import dayjs from 'dayjs';

const $toast = useToast();
const cookieStore = useCookieStore();

// État local des préférences
const localPreferences = ref({
  essential: true,
  analytics: false,
  marketing: false
});

// État de chargement
const isSaving = ref(false);
const lastUpdated = ref<Date | null>(null);

// Charger les préférences au montage
onMounted(async () => {
  await loadCurrentPreferences();
});

// Charger les préférences actuelles
const loadCurrentPreferences = async () => {
  try {
    const apiUrl = import.meta.env.VITE_API_URL as string;
    const response = await fetch(`${apiUrl}/cookieConsent/current`);
    const data = await response.json();
    
    if (data.hasConsent) {
      localPreferences.value = data.preferences;
      lastUpdated.value = new Date(data.lastUpdated);
    } else {
      // Utiliser les préférences du store local
      localPreferences.value = { ...cookieStore.preferences };
    }
  } catch (error) {
    console.warn('Impossible de charger les préférences depuis le serveur:', error);
    // Utiliser les préférences du store local
    localPreferences.value = { ...cookieStore.preferences };
  }
};

// Sauvegarder les préférences
const savePreferences = async () => {
  isSaving.value = true;
  
  try {
    const success = await cookieStore.savePreferences(localPreferences.value);
    
    if (success) {
      $toast.open({
        message: 'Vos préférences ont été sauvegardées avec succès',
        type: 'success',
        position: 'bottom-left',
        duration: 3000
      });
      
      lastUpdated.value = new Date();
    } else {
      throw new Error('Échec de la sauvegarde');
    }
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error);
    $toast.open({
      message: 'Erreur lors de la sauvegarde des préférences',
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    });
  } finally {
    isSaving.value = false;
  }
};

// Accepter tous les cookies
const acceptAll = async () => {
  localPreferences.value = {
    essential: true,
    analytics: true,
    marketing: true
  };
  await savePreferences();
};

// Refuser tous les cookies (sauf essentiels)
const rejectAll = async () => {
  localPreferences.value = {
    essential: true,
    analytics: false,
    marketing: false
  };
  await savePreferences();
};

// Formater la date
const formatDate = (date: Date) => {
  return dayjs(date).format('DD/MM/YYYY à HH:mm');
};
</script>

<style scoped>
.cookie-preferences-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.cookie-preferences-content {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.cookie-header {
  text-align: center;
  margin-bottom: 2rem;
}

.cookie-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1D1F96;
  margin-bottom: 1rem;
}

.cookie-description {
  font-size: 1.1rem;
  color: #666;
  line-height: 1.6;
}

.cookie-status {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 2rem;
  text-align: center;
}

.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #dc3545;
  transition: background 0.3s ease;
}

.status-indicator.active .status-dot {
  background: #28a745;
}

.status-text {
  font-weight: 600;
  color: #333;
}

.status-date {
  font-size: 0.875rem;
  color: #666;
  margin: 0;
}

.cookie-options {
  display: grid;
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.cookie-category {
  border: 2px solid #e9ecef;
  border-radius: 8px;
  padding: 1.5rem;
  transition: border-color 0.3s ease;
}

.cookie-category:hover {
  border-color: #696BE2;
}

.cookie-category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.cookie-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 600;
  color: #333;
}

.cookie-checkbox input[type="checkbox"] {
  width: 20px;
  height: 20px;
  accent-color: #696BE2;
}

.cookie-checkbox input[type="checkbox"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cookie-required {
  font-size: 0.875rem;
  color: #dc3545;
  font-style: italic;
}

.cookie-category-description {
  font-size: 0.95rem;
  color: #666;
  line-height: 1.5;
  margin: 0;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  margin-bottom: 2rem;
}

.cookie-btn {
  padding: 0.875rem 1.75rem;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 180px;
  justify-content: center;
}

.cookie-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
}

.cookie-btn-primary {
  background: #696BE2;
  color: white;
}

.cookie-btn-primary:hover:not(:disabled) {
  background: #5a5cd1;
  transform: translateY(-2px);
}

.cookie-btn-secondary {
  background: #28a745;
  color: white;
}

.cookie-btn-secondary:hover:not(:disabled) {
  background: #218838;
  transform: translateY(-2px);
}

.cookie-btn-reject {
  background: #dc3545;
  color: white;
}

.cookie-btn-reject:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-2px);
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

.cookie-info {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  margin-bottom: 2rem;
}

.cookie-info h3 {
  color: #1D1F96;
  margin-bottom: 1rem;
  font-size: 1.25rem;
}

.info-grid {
  display: grid;
  gap: 1rem;
}

.info-item h4 {
  color: #333;
  margin-bottom: 0.5rem;
  font-size: 1rem;
}

.info-item p {
  color: #666;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

.cookie-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  justify-content: center;
  padding-top: 1rem;
  border-top: 1px solid #e9ecef;
}

.cookie-link {
  color: #696BE2;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.3s ease;
}

.cookie-link:hover {
  color: #1D1F96;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .cookie-preferences-content {
    padding: 1.5rem;
  }
  
  .cookie-title {
    font-size: 2rem;
  }
  
  .cookie-actions {
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
  }
  
  .cookie-links {
    flex-direction: column;
    align-items: center;
  }
}

@media (max-width: 480px) {
  .cookie-preferences-container {
    padding: 1rem 0.5rem;
  }
  
  .cookie-preferences-content {
    padding: 1rem;
  }
  
  .cookie-title {
    font-size: 1.75rem;
  }
}
</style> 