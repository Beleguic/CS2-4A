<template>
  <div class="force-password-change-page">
    <div class="container">
      <div class="header">
        <img src="/src/assets/logo-troupicool.png" alt="Tropicool Logo" class="logo" />
        <h1>🔒 Changement de Mot de Passe Obligatoire</h1>
      </div>

      <div class="alert-banner">
        <div class="alert-content">
          <span class="alert-icon">⚠️</span>
          <div class="alert-text">
            <h3>Votre mot de passe a expiré</h3>
            <p>
              Pour des raisons de sécurité, vous devez changer votre mot de passe 
              avant de pouvoir accéder à votre compte.
            </p>
          </div>
        </div>
      </div>

      <div class="form-container">
        <form @submit.prevent="handleSubmit" class="password-form">
          <div class="form-group">
            <label for="currentPassword">Mot de passe actuel</label>
            <div class="password-input-container">
              <input
                id="currentPassword"
                v-model="formData.currentPassword"
                type="password"
                class="form-input"
                :class="{ 'error': errors.currentPassword }"
                placeholder="Entrez votre mot de passe actuel"
                required
              />
              <button
                type="button"
                @click="togglePasswordVisibility('currentPassword')"
                class="password-toggle"
                :title="showCurrentPassword ? 'Masquer' : 'Afficher'"
              >
                {{ showCurrentPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.currentPassword" class="error-message">
              {{ errors.currentPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="newPassword">Nouveau mot de passe</label>
            <div class="password-input-container">
              <input
                id="newPassword"
                v-model="formData.newPassword"
                type="password"
                class="form-input"
                :class="{ 'error': errors.newPassword }"
                placeholder="Entrez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                @click="togglePasswordVisibility('newPassword')"
                class="password-toggle"
                :title="showNewPassword ? 'Masquer' : 'Afficher'"
              >
                {{ showNewPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.newPassword" class="error-message">
              {{ errors.newPassword }}
            </span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Confirmer le nouveau mot de passe</label>
            <div class="password-input-container">
              <input
                id="confirmPassword"
                v-model="formData.confirmPassword"
                type="password"
                class="form-input"
                :class="{ 'error': errors.confirmPassword }"
                placeholder="Confirmez votre nouveau mot de passe"
                required
              />
              <button
                type="button"
                @click="togglePasswordVisibility('confirmPassword')"
                class="password-toggle"
                :title="showConfirmPassword ? 'Masquer' : 'Afficher'"
              >
                {{ showConfirmPassword ? '🙈' : '👁️' }}
              </button>
            </div>
            <span v-if="errors.confirmPassword" class="error-message">
              {{ errors.confirmPassword }}
            </span>
          </div>

          <!-- Critères de sécurité -->
          <div class="security-criteria">
            <h3>Critères de sécurité requis</h3>
            <div class="criteria-grid">
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.length }"
              >
                <span class="criterion-icon">{{ passwordCriteria.length ? '✅' : '❌' }}</span>
                <span class="criterion-text">Au moins 12 caractères</span>
              </div>
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.lowercase }"
              >
                <span class="criterion-icon">{{ passwordCriteria.lowercase ? '✅' : '❌' }}</span>
                <span class="criterion-text">Au moins une minuscule</span>
              </div>
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.uppercase }"
              >
                <span class="criterion-icon">{{ passwordCriteria.uppercase ? '✅' : '❌' }}</span>
                <span class="criterion-text">Au moins une majuscule</span>
              </div>
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.number }"
              >
                <span class="criterion-icon">{{ passwordCriteria.number ? '✅' : '❌' }}</span>
                <span class="criterion-text">Au moins un chiffre</span>
              </div>
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.symbol }"
              >
                <span class="criterion-icon">{{ passwordCriteria.symbol ? '✅' : '❌' }}</span>
                <span class="criterion-text">Au moins un symbole</span>
              </div>
              <div 
                class="criterion"
                :class="{ 'met': passwordCriteria.match }"
              >
                <span class="criterion-icon">{{ passwordCriteria.match ? '✅' : '❌' }}</span>
                <span class="criterion-text">Les mots de passe correspondent</span>
              </div>
            </div>
          </div>

          <!-- Message d'erreur serveur -->
          <div v-if="serverError" class="server-error">
            <span class="error-icon">❌</span>
            <span class="error-text">{{ serverError }}</span>
          </div>

          <div class="form-actions">
            <button
              type="submit"
              :disabled="!isFormValid || isLoading"
              class="submit-btn"
            >
              <span v-if="isLoading" class="loading-spinner"></span>
              {{ isLoading ? 'Changement en cours...' : 'Changer mon mot de passe' }}
            </button>
          </div>
        </form>
      </div>

      <div class="help-section">
        <h3>Besoin d'aide ?</h3>
        <p>
          Si vous rencontrez des difficultés pour changer votre mot de passe, 
          contactez notre support :
        </p>
        <div class="contact-info">
          <div class="contact-item">
            <span class="contact-icon">📧</span>
            <span>support@tropicool.fr</span>
          </div>
          <div class="contact-item">
            <span class="contact-icon">📞</span>
            <span>01 23 45 67 89</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/authStore';
import { useToast } from 'vue-toast-notification';
import { z } from 'zod';

const router = useRouter();
const authStore = useAuthStore();
const $toast = useToast();

// État du formulaire
const formData = ref({
  currentPassword: '',
  newPassword: '',
  confirmPassword: ''
});

const errors = ref({});
const serverError = ref('');
const isLoading = ref(false);

// Visibilité des mots de passe
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Schéma de validation
const passwordSchema = z.object({
  currentPassword: z.string().min(1, 'Le mot de passe actuel est requis'),
  newPassword: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un symbole'),
  confirmPassword: z.string().min(1, 'La confirmation est requise')
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword']
});

// Computed pour les critères de mot de passe
const passwordCriteria = computed(() => {
  const password = formData.value.newPassword;
  return {
    length: password.length >= 12,
    lowercase: /[a-z]/.test(password),
    uppercase: /[A-Z]/.test(password),
    number: /[0-9]/.test(password),
    symbol: /[^a-zA-Z0-9]/.test(password),
    match: password === formData.value.confirmPassword && password.length > 0
  };
});

// Computed pour la validité du formulaire
const isFormValid = computed(() => {
  return Object.values(passwordCriteria.value).every(criterion => criterion) &&
         formData.value.currentPassword.length > 0;
});

// Méthodes
const togglePasswordVisibility = (field) => {
  switch (field) {
    case 'currentPassword':
      showCurrentPassword.value = !showCurrentPassword.value;
      break;
    case 'newPassword':
      showNewPassword.value = !showNewPassword.value;
      break;
    case 'confirmPassword':
      showConfirmPassword.value = !showConfirmPassword.value;
      break;
  }
};

const validateForm = () => {
  try {
    passwordSchema.parse(formData.value);
    errors.value = {};
    return true;
  } catch (error) {
    if (error instanceof z.ZodError) {
      errors.value = {};
      error.errors.forEach(err => {
        const field = err.path[0];
        errors.value[field] = err.message;
      });
    }
    return false;
  }
};

const handleSubmit = async () => {
  if (!validateForm()) {
    return;
  }

  isLoading.value = true;
  serverError.value = '';

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/force-password-change`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({
        currentPassword: formData.value.currentPassword,
        newPassword: formData.value.newPassword
      })
    });

    const data = await response.json();

    if (response.ok) {
      $toast.open({
        message: 'Mot de passe changé avec succès !',
        type: 'success',
        position: 'bottom-left',
        duration: 5000
      });

      // Rediriger vers le profil ou la page d'accueil
      router.push({ name: 'Profile' });
    } else {
      serverError.value = data.error || 'Erreur lors du changement de mot de passe';
    }
  } catch (error) {
    console.error('Error changing password:', error);
    serverError.value = 'Erreur de connexion. Veuillez réessayer.';
  } finally {
    isLoading.value = false;
  }
};

// Lifecycle
onMounted(() => {
  // Vérifier si l'utilisateur est connecté et si le changement est forcé
  if (!authStore.isLoggedIn) {
    router.push({ name: 'Login' });
    return;
  }

  // Vérifier le statut du mot de passe
  checkPasswordStatus();
});

const checkPasswordStatus = async () => {
  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}/auth/password-status`, {
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (response.ok) {
      const data = await response.json();
      if (!data.forcePasswordChange) {
        // L'utilisateur n'a pas besoin de changer son mot de passe
        router.push({ name: 'Home' });
      }
    }
  } catch (error) {
    console.error('Error checking password status:', error);
  }
};
</script>

<style scoped>
.force-password-change-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem 1rem;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.header {
  text-align: center;
  padding: 2rem;
  background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
  color: white;
}

.logo {
  height: 60px;
  margin-bottom: 1rem;
}

.header h1 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.alert-banner {
  background: #fff3cd;
  border: 1px solid #ffeaa7;
  padding: 1rem;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.alert-icon {
  font-size: 1.5rem;
}

.alert-text h3 {
  margin: 0 0 0.5rem 0;
  color: #856404;
  font-size: 1.1rem;
}

.alert-text p {
  margin: 0;
  color: #856404;
  font-size: 0.9rem;
}

.form-container {
  padding: 2rem;
}

.password-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.password-input-container {
  position: relative;
  display: flex;
  align-items: center;
}

.form-input {
  width: 100%;
  padding: 0.75rem;
  border: 2px solid #e9ecef;
  border-radius: 6px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-input:focus {
  outline: none;
  border-color: #696BE2;
}

.form-input.error {
  border-color: #dc3545;
}

.password-toggle {
  position: absolute;
  right: 0.75rem;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.25rem;
  border-radius: 4px;
  transition: background 0.2s ease;
}

.password-toggle:hover {
  background: rgba(0, 0, 0, 0.1);
}

.error-message {
  color: #dc3545;
  font-size: 0.8rem;
  font-weight: 500;
}

.security-criteria {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border: 1px solid #e9ecef;
}

.security-criteria h3 {
  margin: 0 0 1rem 0;
  color: #1D1F96;
  font-size: 1.1rem;
}

.criteria-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.75rem;
}

.criterion {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  border-radius: 4px;
  background: white;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
}

.criterion.met {
  background: #d4edda;
  border-color: #c3e6cb;
  color: #155724;
}

.criterion-icon {
  font-size: 1rem;
}

.criterion-text {
  font-size: 0.8rem;
  font-weight: 500;
}

.server-error {
  background: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
  padding: 1rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-icon {
  font-size: 1.2rem;
}

.error-text {
  font-weight: 500;
}

.form-actions {
  display: flex;
  justify-content: center;
}

.submit-btn {
  background: #dc3545;
  color: white;
  border: none;
  padding: 1rem 2rem;
  border-radius: 6px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  min-width: 200px;
  justify-content: center;
}

.submit-btn:hover:not(:disabled) {
  background: #c82333;
  transform: translateY(-1px);
}

.submit-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none !important;
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

.help-section {
  background: #e3f2fd;
  padding: 1.5rem;
  border-top: 1px solid #e9ecef;
}

.help-section h3 {
  margin: 0 0 1rem 0;
  color: #1976d2;
  font-size: 1.1rem;
}

.help-section p {
  margin: 0 0 1rem 0;
  color: #333;
  font-size: 0.9rem;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.contact-icon {
  font-size: 1.1rem;
}

/* Responsive */
@media (max-width: 768px) {
  .container {
    margin: 1rem;
  }
  
  .header {
    padding: 1.5rem;
  }
  
  .form-container {
    padding: 1.5rem;
  }
  
  .criteria-grid {
    grid-template-columns: 1fr;
  }
  
  .submit-btn {
    width: 100%;
  }
}

@media (max-width: 480px) {
  .force-password-change-page {
    padding: 1rem 0.5rem;
  }
  
  .header h1 {
    font-size: 1.3rem;
  }
  
  .form-container {
    padding: 1rem;
  }
}
</style> 