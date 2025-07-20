<template>
  <div v-if="!cookieStore.hasConsent" class="cookie-banner">
    <div class="cookie-content">
      <div class="cookie-header">
        <h3 class="cookie-title">🍪 Gestion des Cookies</h3>
        <p class="cookie-description">
          Nous utilisons des cookies pour améliorer votre expérience sur Tropicool. 
          Certains cookies sont essentiels au fonctionnement du site, d'autres nous aident à l'améliorer.
        </p>
      </div>
      
      <div class="cookie-options">
        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
                             <input 
                 type="checkbox" 
                 v-model="cookieStore.preferences.essential" 
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
          </p>
        </div>

        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
                             <input 
                 type="checkbox" 
                 v-model="cookieStore.preferences.analytics"
               />
              <span class="checkmark"></span>
              <strong>Cookies Analytics</strong>
            </label>
          </div>
          <p class="cookie-category-description">
            Nous aident à comprendre comment vous utilisez le site pour l'améliorer.
          </p>
        </div>

        <div class="cookie-category">
          <div class="cookie-category-header">
            <label class="cookie-checkbox">
                             <input 
                 type="checkbox" 
                 v-model="cookieStore.preferences.marketing"
               />
              <span class="checkmark"></span>
              <strong>Cookies Marketing</strong>
            </label>
          </div>
          <p class="cookie-category-description">
            Permettent de vous proposer des offres personnalisées et de mesurer l'efficacité de nos campagnes.
          </p>
        </div>
      </div>

      <div class="cookie-actions">
        <button 
          @click="acceptAll" 
          class="cookie-btn cookie-btn-primary"
        >
          Accepter Tout
        </button>
        <button 
          @click="acceptSelected" 
          class="cookie-btn cookie-btn-secondary"
        >
          Accepter la Sélection
        </button>
        <button 
          @click="rejectAll" 
          class="cookie-btn cookie-btn-reject"
        >
          Refuser Tout
        </button>
      </div>

      <div class="cookie-links">
        <router-link to="/privacy-policy" class="cookie-link">
          Politique de Confidentialité
        </router-link>
        <router-link to="/cookie-preferences" class="cookie-link">
          Gérer mes Préférences
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useToast } from 'vue-toast-notification';
import { useCookieStore } from '@/stores/cookieStore';

const $toast = useToast();
const cookieStore = useCookieStore();

// Vérifier si le consentement existe déjà
onMounted(() => {
  cookieStore.loadPreferences();
});

// Accepter tous les cookies
const acceptAll = async () => {
  const success = await cookieStore.acceptAll();
  if (success) {
    showSuccessMessage();
  } else {
    showErrorMessage();
  }
};

// Accepter la sélection actuelle
const acceptSelected = async () => {
  const success = await cookieStore.acceptSelected();
  if (success) {
    showSuccessMessage();
  } else {
    showErrorMessage();
  }
};

// Refuser tous les cookies (sauf essentiels)
const rejectAll = async () => {
  const success = await cookieStore.rejectAll();
  if (success) {
    showSuccessMessage();
  } else {
    showErrorMessage();
  }
};

// Afficher le message de succès
const showSuccessMessage = () => {
  $toast.open({
    message: 'Vos préférences de cookies ont été sauvegardées',
    type: 'success',
    position: 'bottom-left',
    duration: 3000
  });

  // Émettre l'événement pour informer l'application
  window.dispatchEvent(new CustomEvent('cookie-consent-updated', {
    detail: cookieStore.getCurrentPreferences()
  }));
};

// Afficher le message d'erreur
const showErrorMessage = () => {
  $toast.open({
    message: 'Erreur lors de la sauvegarde des préférences',
    type: 'error',
    position: 'bottom-left',
    duration: 5000
  });
};

// Exposer les préférences pour les autres composants
defineExpose({
  preferences: cookieStore.preferences,
  cookiesAccepted: cookieStore.hasConsent
});
</script>

<style scoped>
.cookie-banner {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(135deg, #696BE2 0%, #1D1F96 100%);
  color: white;
  z-index: 9999;
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.15);
  animation: slideUp 0.5s ease-out;
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}

.cookie-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1.5rem;
}

.cookie-header {
  margin-bottom: 1.5rem;
}

.cookie-title {
  font-size: 1.5rem;
  font-weight: bold;
  margin-bottom: 0.5rem;
  color: white;
}

.cookie-description {
  font-size: 1rem;
  line-height: 1.6;
  opacity: 0.9;
}

.cookie-options {
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.cookie-category {
  background: rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  padding: 1rem;
  backdrop-filter: blur(10px);
}

.cookie-category-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.cookie-checkbox {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  font-weight: 500;
}

.cookie-checkbox input[type="checkbox"] {
  width: 18px;
  height: 18px;
  accent-color: #696BE2;
}

.cookie-checkbox input[type="checkbox"]:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.cookie-required {
  font-size: 0.875rem;
  opacity: 0.7;
  font-style: italic;
}

.cookie-category-description {
  font-size: 0.875rem;
  opacity: 0.8;
  line-height: 1.4;
}

.cookie-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 1rem;
}

.cookie-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  font-size: 0.875rem;
}

.cookie-btn-primary {
  background: #4CAF50;
  color: white;
}

.cookie-btn-primary:hover {
  background: #45a049;
  transform: translateY(-1px);
}

.cookie-btn-secondary {
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.cookie-btn-secondary:hover {
  background: rgba(255, 255, 255, 0.3);
  transform: translateY(-1px);
}

.cookie-btn-reject {
  background: #f44336;
  color: white;
}

.cookie-btn-reject:hover {
  background: #da190b;
  transform: translateY(-1px);
}

.cookie-links {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.cookie-link {
  color: rgba(255, 255, 255, 0.8);
  text-decoration: none;
  font-size: 0.875rem;
  transition: color 0.2s ease;
}

.cookie-link:hover {
  color: white;
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .cookie-content {
    padding: 1rem;
  }
  
  .cookie-actions {
    flex-direction: column;
  }
  
  .cookie-btn {
    width: 100%;
  }
  
  .cookie-links {
    justify-content: center;
  }
}

@media (max-width: 480px) {
  .cookie-title {
    font-size: 1.25rem;
  }
  
  .cookie-description {
    font-size: 0.875rem;
  }
}
</style> 