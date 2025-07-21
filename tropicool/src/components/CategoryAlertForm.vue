<template>
  <div class="space-y-4">
    <!-- En-tête -->
    <div class="flex items-center justify-between">
      <h3 class="text-lg font-medium text-gray-900">
        Sélectionner les catégories
      </h3>
      <button
        @click="selectAll"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Tout sélectionner
      </button>
    </div>

    <!-- Recherche -->
    <div class="relative">
      <input
        v-model="searchQuery"
        type="text"
        placeholder="Rechercher une catégorie..."
        class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
      />
      <div class="absolute inset-y-0 right-0 pr-3 flex items-center">
        <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      </div>
    </div>

    <!-- Liste des catégories -->
    <div class="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
      <div v-if="filteredCategories.length === 0" class="p-4 text-center text-gray-500">
        Aucune catégorie trouvée
      </div>
      
      <div v-else class="divide-y divide-gray-200">
        <div
          v-for="category in filteredCategories"
          :key="category.id"
          class="flex items-center p-3 hover:bg-gray-50 transition-colors duration-150"
        >
          <input
            :id="`category-${category.id}`"
            :checked="isCategorySelected(category.id)"
            @change="toggleCategory(category)"
            type="checkbox"
            class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label
            :for="`category-${category.id}`"
            class="ml-3 flex-1 cursor-pointer"
          >
            <div class="flex items-center justify-between">
              <div>
                <span class="text-sm font-medium text-gray-900">
                  {{ category.name }}
                </span>
                <p v-if="category.description" class="text-xs text-gray-500 mt-1">
                  {{ category.description }}
                </p>
              </div>
              <div class="flex items-center space-x-2">
                <span class="text-xs text-gray-400">
                  {{ getCategoryProductCount(category.id) }} produits
                </span>
                <AlertTypeSelector
                  v-model="getCategoryAlertTypes(category.id)"
                  :alert-types="availableAlertTypes"
                  compact
                  @update="updateCategoryAlertTypes(category.id, $event)"
                />
              </div>
            </div>
          </label>
        </div>
      </div>
    </div>

    <!-- Résumé -->
    <div v-if="selectedCategories.length > 0" class="bg-blue-50 p-4 rounded-md">
      <h4 class="text-sm font-medium text-blue-900 mb-2">
        Catégories sélectionnées ({{ selectedCategories.length }})
      </h4>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="category in selectedCategories"
          :key="category.id"
          class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
        >
          {{ category.name }}
          <button
            @click="removeCategory(category.id)"
            class="ml-1 text-blue-600 hover:text-blue-800"
          >
            ×
          </button>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import AlertTypeSelector from './AlertTypeSelector.vue'

// Props
interface Category {
  id: string
  name: string
  description?: string
  products_count?: number
}

interface Props {
  modelValue: any[]
  categories: Category[]
}

const props = defineProps<Props>()

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: any[]]
  update: [value: any[]]
}>()

// État local
const searchQuery = ref('')
const selectedCategories = ref<any[]>([])
const categoryAlertTypes = ref<Record<string, string[]>>({})

// Types d'alertes disponibles
const availableAlertTypes = ref([
  { id: 'new_products', name: 'Nouveaux produits' },
  { id: 'promotions', name: 'Promotions' },
  { id: 'restock', name: 'Réapprovisionnement' }
])

// Computed
const filteredCategories = computed(() => {
  if (!searchQuery.value) return props.categories
  
  const query = searchQuery.value.toLowerCase()
  return props.categories.filter(category =>
    category.name.toLowerCase().includes(query) ||
    (category.description && category.description.toLowerCase().includes(query))
  )
})

// Méthodes
const isCategorySelected = (categoryId: string): boolean => {
  return selectedCategories.value.some(cat => cat.id === categoryId)
}

const toggleCategory = (category: Category) => {
  const isSelected = isCategorySelected(category.id)
  
  if (isSelected) {
    removeCategory(category.id)
  } else {
    addCategory(category)
  }
}

const addCategory = (category: Category) => {
  if (!isCategorySelected(category.id)) {
    selectedCategories.value.push({
      ...category,
      alert_types: ['new_products'] // Par défaut
    })
    categoryAlertTypes.value[category.id] = ['new_products']
    updateModelValue()
  }
}

const removeCategory = (categoryId: string) => {
  selectedCategories.value = selectedCategories.value.filter(cat => cat.id !== categoryId)
  delete categoryAlertTypes.value[categoryId]
  updateModelValue()
}

const selectAll = () => {
  props.categories.forEach(category => {
    if (!isCategorySelected(category.id)) {
      addCategory(category)
    }
  })
}

const getCategoryProductCount = (categoryId: string): number => {
  const category = props.categories.find(cat => cat.id === categoryId)
  return category?.products_count || 0
}

const getCategoryAlertTypes = (categoryId: string): string[] => {
  return categoryAlertTypes.value[categoryId] || []
}

const updateCategoryAlertTypes = (categoryId: string, alertTypes: string[]) => {
  categoryAlertTypes.value[categoryId] = alertTypes
  
  // Mettre à jour la catégorie sélectionnée
  const categoryIndex = selectedCategories.value.findIndex(cat => cat.id === categoryId)
  if (categoryIndex !== -1) {
    selectedCategories.value[categoryIndex].alert_types = alertTypes
    updateModelValue()
  }
}

const updateModelValue = () => {
  const value = selectedCategories.value.map(category => ({
    category_id: category.id,
    alert_type_id: categoryAlertTypes.value[category.id] || ['new_products']
  }))
  
  emit('update:modelValue', value)
  emit('update', value)
}

// Watchers
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue.length > 0) {
    // Synchroniser avec les données reçues
    selectedCategories.value = newValue.map(item => {
      const category = props.categories.find(cat => cat.id === item.category_id)
      return category ? { ...category, alert_types: item.alert_type_id } : null
    }).filter(Boolean)
    
    // Synchroniser les types d'alertes
    newValue.forEach(item => {
      categoryAlertTypes.value[item.category_id] = item.alert_type_id
    })
  }
}, { immediate: true })
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 