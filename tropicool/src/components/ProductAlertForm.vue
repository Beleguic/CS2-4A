<template>
  <div class="space-y-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">
        Sélectionner les produits
      </h3>
      <div class="flex items-center space-x-2">
        <span class="text-sm text-gray-500">
          {{ selectedProducts.length }} sélectionné(s)
        </span>
        <button
          @click="clearSelection"
          v-if="selectedProducts.length > 0"
          class="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Tout effacer
        </button>
      </div>
    </div>

    <!-- Recherche -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher un produit..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Liste des produits -->
    <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
      <div v-if="filteredProducts.length === 0" class="p-4 text-center text-gray-500">
        Aucun produit trouvé
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="product in filteredProducts"
          :key="product.id"
          class="flex items-center p-3 hover:bg-gray-50 transition-colors duration-150"
        >
          <input
            :id="`product-${product.id}`"
            :checked="isProductSelected(product.id)"
            @change="toggleProduct(product)"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            :for="`product-${product.id}`"
            class="ml-3 flex-1 cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div class="flex items-center space-x-3">
                <!-- Image du produit -->
                <div class="flex-shrink-0">
                  <img
                    :src="product.image || '/placeholder-product.png'"
                    :alt="product.name"
                    class="w-10 h-10 rounded-md object-cover"
                    @error="$event.target.src = '/placeholder-product.png'"
                  />
                </div>
                
                <!-- Informations du produit -->
                <div>
                  <span class="text-sm font-medium text-gray-900">
                    {{ product.name }}
                  </span>
                  <div class="flex items-center space-x-2 mt-1">
                    <span class="text-sm text-gray-500">
                      {{ formatPrice(product.price) }}
                    </span>
                    <span v-if="product.stock !== undefined" class="text-xs text-gray-400">
                      Stock: {{ product.stock }}
                    </span>
                  </div>
                </div>
              </div>
              
              <!-- Types d'alertes -->
              <div class="flex items-center space-x-2">
                <AlertTypeSelector
                  v-model="getProductAlertTypes(product.id)"
                  :alert-types="availableAlertTypes"
                  compact
                  @update="updateProductAlertTypes(product.id, $event)"
                />
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Résumé des produits sélectionnés -->
    <div v-if="selectedProducts.length > 0" class="bg-green-50 p-4 rounded-md">
      <h4 class="text-sm font-medium text-green-900 mb-2">
        Produits sélectionnés ({{ selectedProducts.length }})
      </h4>
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
        <div
          v-for="product in selectedProducts"
          :key="product.id"
          class="flex items-center justify-between p-2 bg-white rounded border"
        >
          <div class="flex items-center space-x-2">
            <img
              :src="product.image || '/placeholder-product.png'"
              :alt="product.name"
              class="w-6 h-6 rounded object-cover"
              @error="$event.target.src = '/placeholder-product.png'"
            />
            <span class="text-xs font-medium text-gray-900 truncate">
              {{ product.name }}
            </span>
          </div>
          <button
            @click="removeProduct(product.id)"
            class="text-red-500 hover:text-red-700 text-xs"
          >
            ×
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AlertTypeSelector from './AlertTypeSelector.vue'

// Props
interface Product {
  id: string
  name: string
  price: number
  image?: string
  stock?: number
  description?: string
}

interface Props {
  modelValue: any[]
  products: Product[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  update: [value: any[]]
}>()

// État local
const searchQuery = ref('')
const selectedProducts = ref<any[]>([])
const productAlertTypes = ref<Record<string, string[]>>({})

// Types d'alertes disponibles
const availableAlertTypes = ref([
  { id: 'restock', name: 'Réapprovisionnement' },
  { id: 'promotions', name: 'Promotions' },
  { id: 'price_change', name: 'Changement de prix' }
])

// Computed
const filteredProducts = computed(() => {
  if (!searchQuery.value) return props.products
  
  const query = searchQuery.value.toLowerCase()
  return props.products.filter(product =>
    product.name.toLowerCase().includes(query) ||
    (product.description && product.description.toLowerCase().includes(query))
  )
})

// Méthodes
const isProductSelected = (productId: string): boolean => {
  return selectedProducts.value.some(prod => prod.id === productId)
}

const toggleProduct = (product: Product) => {
  const isSelected = isProductSelected(product.id)
  
  if (isSelected) {
    removeProduct(product.id)
  } else {
    addProduct(product)
  }
}

const addProduct = (product: Product) => {
  if (!isProductSelected(product.id)) {
    selectedProducts.value.push({
      ...product,
      alert_types: ['restock'] // Par défaut
    })
    productAlertTypes.value[product.id] = ['restock']
    updateModelValue()
  }
}

const removeProduct = (productId: string) => {
  selectedProducts.value = selectedProducts.value.filter(prod => prod.id !== productId)
  delete productAlertTypes.value[productId]
  updateModelValue()
}

const clearSelection = () => {
  selectedProducts.value = []
  productAlertTypes.value = {}
  updateModelValue()
}

const getProductAlertTypes = (productId: string): string[] => {
  return productAlertTypes.value[productId] || []
}

const updateProductAlertTypes = (productId: string, alertTypes: string[]) => {
  productAlertTypes.value[productId] = alertTypes
  
  // Mettre à jour le produit sélectionné
  const productIndex = selectedProducts.value.findIndex(prod => prod.id === productId)
  if (productIndex !== -1) {
    selectedProducts.value[productIndex].alert_types = alertTypes
    updateModelValue()
  }
}

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(price)
}

const updateModelValue = () => {
  const value = selectedProducts.value.map(product => ({
    product_id: product.id,
    alert_type_id: productAlertTypes.value[product.id] || ['restock']
  }))
  
  emit('update:modelValue', value)
  emit('update', value)
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length > 0) {
    // Synchroniser avec les données reçues
    selectedProducts.value = newValue.map(item => {
      const product = props.products.find(prod => prod.id === item.product_id)
      return product ? { ...product, alert_types: item.alert_type_id } : null
    }).filter(Boolean)
    
    // Synchroniser les types d'alertes
    newValue.forEach(item => {
      productAlertTypes.value[item.product_id] = item.alert_type_id
    })
  }
}, { immediate: true })
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 