<template>
  <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
    <div class="flex items-center space-x-4">
      <!-- Icône -->
      <div class="flex-shrink-0">
        <div class="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <span class="text-xl">{{ icon }}</span>
        </div>
      </div>
      
      <!-- Contenu -->
      <div class="flex-1 min-w-0">
        <h3 class="text-sm font-medium text-gray-900">
          {{ title }}
        </h3>
        <p class="text-sm text-gray-500 mt-1">
          {{ description }}
        </p>
      </div>
    </div>
    
    <!-- Toggle Switch -->
    <div class="flex-shrink-0 ml-4">
      <button
        @click="toggleAlert"
        :disabled="disabled"
        :class="[
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
          modelValue 
            ? 'bg-blue-600 hover:bg-blue-700' 
            : 'bg-gray-200 hover:bg-gray-300',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
        ]"
        :aria-checked="modelValue"
        role="switch"
        :aria-label="`${modelValue ? 'Désactiver' : 'Activer'} ${title}`"
      >
        <span
          :class="[
            'inline-block h-4 w-4 transform rounded-full bg-white transition duration-200 ease-in-out',
            modelValue ? 'translate-x-6' : 'translate-x-1'
          ]"
        />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

// Props
interface Props {
  modelValue: boolean
  title: string
  description: string
  icon: string
  disabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  disabled: false
})

// Emits
const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

// Méthodes
const toggleAlert = () => {
  if (!props.disabled) {
    emit('update:modelValue', !props.modelValue)
  }
}
</script>

<style scoped>
/* Styles spécifiques si nécessaire */
</style> 