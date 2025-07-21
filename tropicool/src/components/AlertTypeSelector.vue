<template>
  <div class="space-y-2">
    <!-- Mode normal -->
    <div v-if="!compact" class="space-y-3">
      <div
        v-for="alertType in alertTypes"
        :key="alertType.id"
        class="flex items-center"
      >
        <input
          :id="`alert-type-${alertType.id}`"
          :value="alertType.id"
          :checked="isSelected(alertType.id)"
          @change="toggleAlertType(alertType.id)"
          type="checkbox"
          class="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label
          :for="`alert-type-${alertType.id}`"
          class="ml-3 flex-1 cursor-pointer"
        >
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm font-medium text-gray-900">
                {{ alertType.name }}
              </span>
              <p v-if="alertType.description" class="text-xs text-gray-500 mt-1">
                {{ alertType.description }}
              </p>
            </div>
            <div v-if="alertType.icon" class="text-lg">
              {{ alertType.icon }}
            </div>
          </div>
        </label>
      </div>
    </div>

    <!-- Mode compact -->
    <div v-else class="flex flex-wrap gap-1">
      <button
        v-for="alertType in alertTypes"
        :key="alertType.id"
        @click="toggleAlertType(alertType.id)"
        :class="[
          'inline-flex items-center px-2 py-1 rounded-full text-xs font-medium transition-colors duration-200',
          isSelected(alertType.id)
            ? 'bg-blue-100 text-blue-800 border border-blue-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200 hover:bg-gray-200'
        ]"
        :title="alertType.name"
      >
        <span v-if="alertType.icon" class="mr-1">
          {{ alertType.icon }}
        </span>
        <span class="truncate max-w-20">
          {{ getCompactName(alertType.name) }}
        </span>
      </button>
    </div>

    <!-- Actions rapides (mode normal uniquement) -->
    <div v-if="!compact && alertTypes.length > 1" class="flex items-center space-x-4 pt-2 border-t border-gray-200">
      <button
        @click="selectAll"
        class="text-sm text-blue-600 hover:text-blue-700 font-medium"
      >
        Tout sélectionner
      </button>
      <button
        @click="clearAll"
        class="text-sm text-gray-600 hover:text-gray-700 font-medium"
      >
        Tout effacer
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props
interface AlertType {
  id: string
  name: string
  description?: string
  icon?: string
}

interface Props {
  modelValue: string[]
  alertTypes: AlertType[]
  compact?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  compact: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: string[]]
  update: [value: string[]]
}>()

// Méthodes
const isSelected = (alertTypeId: string): boolean => {
  return props.modelValue.includes(alertTypeId)
}

const toggleAlertType = (alertTypeId: string) => {
  const newValue = [...props.modelValue]
  const index = newValue.indexOf(alertTypeId)
  
  if (index > -1) {
    newValue.splice(index, 1)
  } else {
    newValue.push(alertTypeId)
  }
  
  emit('update:modelValue', newValue)
  emit('update', newValue)
}

const selectAll = () => {
  const allIds = props.alertTypes.map(type => type.id)
  emit('update:modelValue', allIds)
  emit('update', allIds)
}

const clearAll = () => {
  emit('update:modelValue', [])
  emit('update', [])
}

const getCompactName = (name: string): string => {
  // Raccourcir les noms pour le mode compact
  const shortNames: Record<string, string> = {
    'Nouveaux produits': 'Nouveaux',
    'Promotions': 'Promos',
    'Réapprovisionnement': 'Restock',
    'Changement de prix': 'Prix',
    'Newsletter': 'News'
  }
  
  return shortNames[name] || name.substring(0, 8)
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 