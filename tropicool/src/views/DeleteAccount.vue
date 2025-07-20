<template>
  <div class="min-h-screen bg-gray-50 py-12">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="text-center mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-4">
          🔒 Suppression de Compte
        </h1>
        <p class="text-lg text-gray-600">
          Conformité RGPD - Droit à l'effacement
        </p>
      </div>

      <!-- Alertes d'information -->
      <div class="bg-blue-50 border-l-4 border-blue-400 p-4 mb-8">
        <div class="flex">
          <div class="flex-shrink-0">
            <svg class="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
              <path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd" />
            </svg>
          </div>
          <div class="ml-3">
            <h3 class="text-sm font-medium text-blue-800">
              Information importante
            </h3>
            <div class="mt-2 text-sm text-blue-700">
              <p>
                Conformément au RGPD, nous anonymisons vos données au lieu de les supprimer définitivement. 
                Cela nous permet de maintenir l'intégrité de nos services tout en respectant vos droits.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Étapes de suppression -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Que se passe-t-il lors de la suppression ?
        </h2>
        
        <div class="space-y-4">
          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-red-600 font-semibold">1</span>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Anonymisation des données</h3>
              <p class="text-sm text-gray-600">
                Vos informations personnelles (nom, email, adresse) seront remplacées par des données anonymes.
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-red-600 font-semibold">2</span>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Sauvegarde sécurisée</h3>
              <p class="text-sm text-gray-600">
                Vos données originales seront sauvegardées de manière sécurisée pour des raisons légales.
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
              <span class="text-red-600 font-semibold">3</span>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Accès immédiat perdu</h3>
              <p class="text-sm text-gray-600">
                Vous ne pourrez plus accéder à votre compte après la suppression.
              </p>
            </div>
          </div>

          <div class="flex items-start">
            <div class="flex-shrink-0 w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
              <span class="text-green-600 font-semibold">4</span>
            </div>
            <div class="ml-4">
              <h3 class="text-sm font-medium text-gray-900">Possibilité de recréation</h3>
              <p class="text-sm text-gray-600">
                Vous pourrez recréer un compte avec le même email si vous le souhaitez.
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Données qui seront anonymisées -->
      <div class="bg-white shadow rounded-lg p-6 mb-8">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Données qui seront anonymisées
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Informations personnelles</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Nom et prénom</li>
              <li>• Adresse email</li>
              <li>• Numéro de téléphone</li>
              <li>• Adresse postale</li>
              <li>• Date de naissance</li>
            </ul>
          </div>

          <div class="bg-gray-50 p-4 rounded-lg">
            <h3 class="font-medium text-gray-900 mb-2">Données associées</h3>
            <ul class="text-sm text-gray-600 space-y-1">
              <li>• Historique des commandes</li>
              <li>• Préférences de newsletter</li>
              <li>• Alertes et notifications</li>
              <li>• Historique des mots de passe</li>
              <li>• Données de panier</li>
            </ul>
          </div>
        </div>
      </div>

      <!-- Formulaire de confirmation -->
      <div class="bg-white shadow rounded-lg p-6">
        <h2 class="text-xl font-semibold text-gray-900 mb-4">
          Confirmation de suppression
        </h2>

        <form @submit.prevent="confirmDeletion" class="space-y-6">
          <!-- Mot de passe de confirmation -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
              Mot de passe de confirmation
            </label>
            <input
              id="password"
              v-model="formData.password"
              type="password"
              required
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Entrez votre mot de passe pour confirmer"
            />
          </div>

          <!-- Raison de suppression -->
          <div>
            <label for="reason" class="block text-sm font-medium text-gray-700 mb-2">
              Raison de la suppression (optionnel)
            </label>
            <select
              id="reason"
              v-model="formData.reason"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
            >
              <option value="RGPD_REQUEST">Demande RGPD</option>
              <option value="PRIVACY_CONCERNS">Préoccupations de confidentialité</option>
              <option value="NO_LONGER_NEEDED">Compte plus nécessaire</option>
              <option value="OTHER">Autre raison</option>
            </select>
          </div>

          <!-- Commentaire optionnel -->
          <div v-if="formData.reason === 'OTHER'">
            <label for="comment" class="block text-sm font-medium text-gray-700 mb-2">
              Précisez la raison
            </label>
            <textarea
              id="comment"
              v-model="formData.comment"
              rows="3"
              class="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-red-500 focus:border-red-500"
              placeholder="Décrivez la raison de votre demande..."
            ></textarea>
          </div>

          <!-- Checkbox de confirmation -->
          <div class="flex items-start">
            <div class="flex items-center h-5">
              <input
                id="confirm"
                v-model="formData.confirmed"
                type="checkbox"
                required
                class="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
              />
            </div>
            <div class="ml-3 text-sm">
              <label for="confirm" class="font-medium text-gray-700">
                Je confirme que je souhaite supprimer mon compte
              </label>
              <p class="text-gray-500">
                Cette action est irréversible. Toutes mes données personnelles seront anonymisées.
              </p>
            </div>
          </div>

          <!-- Boutons d'action -->
          <div class="flex justify-end space-x-4">
            <button
              type="button"
              @click="cancelDeletion"
              class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Annuler
            </button>
            <button
              type="submit"
              :disabled="!formData.confirmed || isDeleting"
              class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span v-if="isDeleting" class="flex items-center">
                <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Suppression en cours...
              </span>
              <span v-else>
                Supprimer mon compte
              </span>
            </button>
          </div>
        </form>
      </div>

      <!-- Modal de confirmation finale -->
      <div v-if="showFinalConfirmation" class="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
        <div class="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
          <div class="mt-3 text-center">
            <div class="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
              <svg class="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 class="text-lg font-medium text-gray-900 mt-4">
              Dernière confirmation
            </h3>
            <div class="mt-2 px-7 py-3">
              <p class="text-sm text-gray-500">
                Êtes-vous absolument sûr de vouloir supprimer votre compte ? 
                Cette action ne peut pas être annulée.
              </p>
            </div>
            <div class="items-center px-4 py-3">
              <button
                @click="proceedWithDeletion"
                :disabled="isDeleting"
                class="px-4 py-2 bg-red-600 text-white text-base font-medium rounded-md w-full shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-300 disabled:opacity-50"
              >
                Oui, supprimer définitivement
              </button>
              <button
                @click="showFinalConfirmation = false"
                class="mt-2 px-4 py-2 bg-gray-300 text-gray-700 text-base font-medium rounded-md w-full shadow-sm hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import axios from 'axios'

const router = useRouter()
const authStore = useAuthStore()

// État du formulaire
const formData = reactive({
  password: '',
  reason: 'RGPD_REQUEST',
  comment: '',
  confirmed: false
})

// États de l'interface
const isDeleting = ref(false)
const showFinalConfirmation = ref(false)

// Confirmation de suppression
const confirmDeletion = () => {
  if (!formData.confirmed) {
    alert('Veuillez confirmer que vous souhaitez supprimer votre compte.')
    return
  }

  if (!formData.password) {
    alert('Veuillez entrer votre mot de passe de confirmation.')
    return
  }

  showFinalConfirmation.value = true
}

// Procéder à la suppression
const proceedWithDeletion = async () => {
  try {
    isDeleting.value = true

    const userId = authStore.user?.id
    if (!userId) {
      throw new Error('Utilisateur non connecté')
    }

    // Vérifier le mot de passe d'abord
    const passwordCheck = await axios.post('/api/auth/validate-password', {
      password: formData.password
    })

    if (!passwordCheck.data.isValid) {
      throw new Error('Mot de passe incorrect')
    }

    // Procéder à l'anonymisation
    const response = await axios.post(`/api/user/${userId}/anonymize`, {
      reason: formData.reason + (formData.comment ? `: ${formData.comment}` : '')
    })

    if (response.data.success) {
      // Déconnexion et redirection
      await authStore.logout()
      router.push('/')
      
      // Afficher un message de succès
      alert('Votre compte a été supprimé avec succès. Vous pouvez recréer un compte avec le même email si vous le souhaitez.')
    }

  } catch (error: any) {
    console.error('Erreur lors de la suppression:', error)
    
    if (error.response?.data?.error) {
      alert(`Erreur: ${error.response.data.error}`)
    } else {
      alert('Une erreur est survenue lors de la suppression de votre compte.')
    }
  } finally {
    isDeleting.value = false
    showFinalConfirmation.value = false
  }
}

// Annuler la suppression
const cancelDeletion = () => {
  router.push('/profile')
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 