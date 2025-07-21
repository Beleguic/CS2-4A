<template>
  <div class="min-h-screen bg-gray-50 py-8">
    <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- En-tête -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-gray-900 mb-2">
          🔔 Gestion des Alertes
        </h1>
        <p class="text-lg text-gray-600">
          Personnalisez vos notifications pour rester informé de nos nouveautés
        </p>
      </div>

      <!-- Alertes Générales -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Alertes Générales
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Recevez des notifications sur les événements importants
          </p>
        </div>
        <div class="p-6 space-y-4">
          <AlertToggle
            v-model="generalAlerts.newsletter"
            title="Newsletter"
            description="Recevez nos newsletters avec les dernières actualités et offres"
            icon="📧"
            @update:modelValue="handleGeneralAlertsUpdate({ newsletter: $event })"
          />
          <AlertToggle
            v-model="generalAlerts.newProducts"
            title="Nouveaux Produits"
            description="Soyez informé en premier des nouveaux produits ajoutés"
            icon="🆕"
            @update:modelValue="handleGeneralAlertsUpdate({ newProducts: $event })"
          />
          <AlertToggle
            v-model="generalAlerts.promotions"
            title="Promotions"
            description="Ne manquez aucune promotion ou offre spéciale"
            icon="🎉"
            @update:modelValue="handleGeneralAlertsUpdate({ promotions: $event })"
          />
        </div>
      </div>

      <!-- Alertes par Catégorie -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Alertes par Catégorie
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Choisissez les catégories qui vous intéressent
          </p>
        </div>
        <div class="p-6">
          <CategoryAlertForm
            v-model="categoryAlerts"
            :categories="categories"
            @update="handleCategoryAlertsUpdate"
          />
        </div>
      </div>

      <!-- Alertes par Produit -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Alertes par Produit
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Suivez vos produits préférés
          </p>
        </div>
        <div class="p-6">
          <ProductAlertForm
            v-model="productAlerts"
            :products="products"
            @update="handleProductAlertsUpdate"
          />
        </div>
      </div>

      <!-- Types d'Alertes -->
      <div class="bg-white shadow rounded-lg mb-8">
        <div class="px-6 py-4 border-b border-gray-200">
          <h2 class="text-xl font-semibold text-gray-900">
            Types d'Alertes
          </h2>
          <p class="text-sm text-gray-600 mt-1">
            Choisissez les types de notifications que vous souhaitez recevoir
          </p>
        </div>
        <div class="p-6">
          <AlertTypeSelector
            v-model="selectedAlertTypes"
            :alert-types="alertTypes"
            @update="handleAlertTypesUpdate"
          />
        </div>
      </div>

      <!-- Boutons d'action -->
      <div class="flex justify-end space-x-4">
        <button
          @click="resetToDefaults"
          :disabled="isLoading"
          class="px-6 py-3 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          Réinitialiser
        </button>
        <button
          @click="savePreferences"
          :disabled="isLoading"
          class="px-6 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
        >
          <span v-if="isLoading" class="flex items-center">
            <svg class="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Sauvegarde...
          </span>
          <span v-else>
            Sauvegarder les Préférences
          </span>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, watch, computed } from 'vue'
import { useToast } from 'vue-toast-notification'
import { useAlertStore } from '@/stores/alertStore'
import AlertToggle from '@/components/AlertToggle.vue'
import CategoryAlertForm from '@/components/CategoryAlertForm.vue'
import ProductAlertForm from '@/components/ProductAlertForm.vue'
import AlertTypeSelector from '@/components/AlertTypeSelector.vue'

const $toast = useToast()
const alertStore = useAlertStore()

// Computed pour accéder aux données du store
const isLoading = computed(() => alertStore.isLoading)
const error = computed(() => alertStore.error)
const categories = computed(() => alertStore.categories)
const products = computed(() => alertStore.products)
const alertTypes = computed(() => alertStore.alertTypes)
const generalAlerts = computed(() => alertStore.generalAlerts)
const categoryAlerts = computed(() => alertStore.categoryAlerts)
const productAlerts = computed(() => alertStore.productAlerts)
const selectedAlertTypes = computed(() => alertStore.alertTypes.map(type => type.id))

// Charger les données
const loadData = async () => {
  try {
    await alertStore.initializeStore()
  } catch (error) {
    console.error('Erreur lors du chargement des données:', error)
    $toast.open({
      message: 'Erreur lors du chargement des données',
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    })
  }
}

// Gestionnaires d'événements
const handleCategoryAlertsUpdate = (alerts: any[]) => {
  alertStore.updateCategoryAlerts(alerts)
}

const handleProductAlertsUpdate = (alerts: any[]) => {
  alertStore.updateProductAlerts(alerts)
}

const handleAlertTypesUpdate = (types: string[]) => {
  // Mise à jour des types d'alertes sélectionnés
  console.log('Types d\'alertes mis à jour:', types)
}

const handleGeneralAlertsUpdate = (alerts: any) => {
  alertStore.updateGeneralAlerts(alerts)
}

// Sauvegarder les préférences
const savePreferences = async () => {
  try {
    const success = await alertStore.savePreferences()
    
    if (success) {
      $toast.open({
        message: 'Préférences sauvegardées avec succès',
        type: 'success',
        position: 'bottom-left',
        duration: 3000
      })
    } else {
      throw new Error('Erreur lors de la sauvegarde')
    }
    
  } catch (error) {
    console.error('Erreur lors de la sauvegarde:', error)
    $toast.open({
      message: 'Erreur lors de la sauvegarde des préférences',
      type: 'error',
      position: 'bottom-left',
      duration: 5000
    })
  }
}

// Réinitialiser aux valeurs par défaut
const resetToDefaults = () => {
  alertStore.resetPreferences()
  
  $toast.open({
    message: 'Préférences réinitialisées',
    type: 'info',
    position: 'bottom-left',
    duration: 3000
  })
}

// Initialisation
onMounted(() => {
  loadData()
})
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 