<template>
  <div class="relative w-full bg-custom">
    <div class="flex flex-col items-center gap-4">
      <img src="/logo-troupicool.png" class="w-40">
      <div class="w-full max-w-md bg-main p-8 rounded-3xl shadow-lg mb-16 grid gap-8">
        <h2 class="text-2xl font-bold mb-1 text-center text-white">Inscription</h2>
        
        <!-- Formulaire d'inscription -->
        <form @submit.prevent="register" class="space-y-4">
          <!-- Nom et Prénom -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium text-white mb-1">Nom *</label>
              <input
                v-model="formData.lastName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre nom"
              />
            </div>
            <div>
              <label class="block text-sm font-medium text-white mb-1">Prénom *</label>
              <input
                v-model="formData.firstName"
                type="text"
                required
                class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Votre prénom"
              />
            </div>
          </div>

          <!-- Nom d'utilisateur -->
          <div>
            <label class="block text-sm font-medium text-white mb-1">Nom d'utilisateur *</label>
            <input
              v-model="formData.username"
              type="text"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Nom d'utilisateur"
            />
          </div>

          <!-- Email -->
          <div>
            <label class="block text-sm font-medium text-white mb-1">Adresse email *</label>
            <input
              v-model="formData.email"
              type="email"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="votre@email.com"
            />
          </div>

          <!-- Mot de passe -->
          <div>
            <label class="block text-sm font-medium text-white mb-1">Mot de passe *</label>
            <input
              v-model="formData.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Mot de passe"
              @input="validatePasswordInput"
            />
            
            <!-- Indicateur de force du mot de passe -->
            <div v-if="formData.password" class="mt-2">
              <PasswordStrengthMeter :password="formData.password" />
            </div>
          </div>

          <!-- Confirmation mot de passe -->
          <div>
            <label class="block text-sm font-medium text-white mb-1">Confirmez le mot de passe *</label>
            <input
              v-model="formData.confirmPassword"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirmez le mot de passe"
            />
            <div v-if="formData.confirmPassword && formData.password !== formData.confirmPassword" class="mt-1 text-red-300 text-sm">
              Les mots de passe ne correspondent pas
            </div>
          </div>

          <!-- Date de naissance -->
          <div>
            <label class="block text-sm font-medium text-white mb-1">Date de naissance *</label>
            <input
              v-model="formData.birthday"
              type="date"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <!-- Conditions générales -->
          <div class="flex items-start">
            <input
              v-model="formData.acceptTerms"
              type="checkbox"
              required
              class="mt-1 h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
            />
            <label class="ml-2 text-sm text-white">
              J'accepte les 
              <router-link to="/conditions-generales-dutilisation" class="text-blue-300 hover:underline">
                conditions générales d'utilisation
              </router-link>
            </label>
          </div>

          <!-- Messages d'erreur -->
          <div v-if="passwordErrors.length > 0" class="bg-red-50 border border-red-200 rounded-md p-3">
            <h4 class="text-sm font-medium text-red-800 mb-2">Erreurs de validation du mot de passe :</h4>
            <ul class="text-sm text-red-700 space-y-1">
              <li v-for="error in passwordErrors" :key="error">• {{ error }}</li>
            </ul>
          </div>

          <!-- Bouton d'inscription -->
          <button
            type="submit"
            :disabled="!isFormValid || isSubmitting"
            class="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Inscription en cours...</span>
            <span v-else>S'inscrire</span>
          </button>
        </form>

        <div class="flex items-center justify-between">
          <router-link :to="{ name : 'Login' } " class="text-white hover:underline">Se connecter</router-link>
          <router-link :to="{ name : 'ForgotPassword' }" class="text-white hover:underline">Mot de passe oublié ?</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useToast } from 'vue-toast-notification';
import { validatePassword, confirmPasswordSchema } from '@/composables/usePasswordValidation';
import PasswordStrengthMeter from '@/components/PasswordStrengthMeter.vue';

const $toast = useToast();
const router = useRouter();
const apiUrl = import.meta.env.VITE_API_URL;

// État du formulaire
const formData = reactive({
  lastName: '',
  firstName: '',
  username: '',
  email: '',
  password: '',
  confirmPassword: '',
  birthday: '',
  acceptTerms: false
});

// États de l'interface
const isSubmitting = ref(false);
const passwordErrors = ref<string[]>([]);

// Validation du mot de passe
const validatePasswordInput = () => {
  if (formData.password) {
    const validation = validatePassword(formData.password);
    passwordErrors.value = validation.errors;
  } else {
    passwordErrors.value = [];
  }
};

// Validation de la confirmation de mot de passe
const validateConfirmPassword = () => {
  try {
    confirmPasswordSchema.parse({
      password: formData.password,
      confirmPassword: formData.confirmPassword
    });
    return true;
  } catch (error) {
    return false;
  }
};

// Validation complète du formulaire
const isFormValid = computed(() => {
  return (
    formData.lastName.trim() !== '' &&
    formData.firstName.trim() !== '' &&
    formData.username.trim() !== '' &&
    formData.email.trim() !== '' &&
    formData.password.trim() !== '' &&
    formData.confirmPassword.trim() !== '' &&
    formData.birthday !== '' &&
    formData.acceptTerms &&
    passwordErrors.value.length === 0 &&
    validateConfirmPassword()
  );
});

const register = async () => {
  // Validation côté client
  if (!isFormValid.value) {
    $toast.open({
      message: 'Veuillez corriger les erreurs dans le formulaire',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  // Validation spécifique du mot de passe
  if (passwordErrors.value.length > 0) {
    $toast.open({
      message: 'Le mot de passe ne respecte pas les exigences de sécurité CNIL',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  // Validation de la confirmation
  if (formData.password !== formData.confirmPassword) {
    $toast.open({
      message: 'Les mots de passe ne correspondent pas !',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  if (!formData.acceptTerms) {
    $toast.open({
      message: 'Vous devez accepter les conditions générales d\'utilisation.',
      type: 'error',
      position: 'bottom-left',
    });
    return;
  }

  isSubmitting.value = true;

  try {
    const requestBody = {
      lastName: formData.lastName,
      firstName: formData.firstName,
      username: formData.username,
      email: formData.email,
      password: formData.password,
      dateOfBirth: formData.birthday,
    };

    const response = await fetch(`${apiUrl}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const responseData = await response.json();

    if (response.ok) {
      $toast.open({
        message: "Inscription réussie! Vérifiez votre email pour confirmer votre inscription",
        type: 'success',
        position: 'bottom-left',
      });
      router.push('/');
    } else {
      // Gestion des erreurs spécifiques du serveur
      const errorMessage = responseData.error || responseData.message || "Échec lors de l'inscription, veuillez recommencer";
      $toast.open({
        message: errorMessage,
        type: 'error',
        position: 'bottom-left',
      });
    }
  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    $toast.open({
      message: "Erreur de connexion, veuillez recommencer",
      type: 'error',
      position: 'bottom-left',
    });
  } finally {
    isSubmitting.value = false;
  }
};
</script>

<style scoped>
body {
  background-color: #FFFCE6;
  margin: 0;
  overflow: hidden;
}

.bg-custom {
  background: url('image-background.jpg') repeat center center;
  background-size: cover;
}

h2 {
  color: #FFFFFF;
}
</style>
