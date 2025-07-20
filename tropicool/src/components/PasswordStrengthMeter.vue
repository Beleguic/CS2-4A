<template>
  <div class="password-strength-meter">
    <!-- Indicateur de force -->
    <div class="mb-3">
      <div class="flex items-center justify-between mb-2">
        <span class="text-sm font-medium text-gray-700">Force du mot de passe</span>
        <span class="text-sm font-semibold" :class="strengthColorClass">
          {{ strength.level }}
        </span>
      </div>
      
      <!-- Barre de progression -->
      <div class="w-full bg-gray-200 rounded-full h-2">
        <div 
          class="h-2 rounded-full transition-all duration-300"
          :class="strengthBarClass"
          :style="{ width: `${Math.min((strength.score / 10) * 100, 100)}%` }"
        ></div>
      </div>
    </div>

    <!-- Exigences CNIL -->
    <div class="mb-4">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Exigences CNIL :</h4>
      <ul class="space-y-1">
        <li 
          v-for="(requirement, index) in requirements" 
          :key="index"
          class="flex items-center text-xs"
          :class="requirementMet(index) ? 'text-green-600' : 'text-gray-500'"
        >
          <svg 
            v-if="requirementMet(index)"
            class="w-3 h-3 mr-2 text-green-500" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
          <svg 
            v-else
            class="w-3 h-3 mr-2 text-gray-400" 
            fill="currentColor" 
            viewBox="0 0 20 20"
          >
            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z" clip-rule="evenodd" />
          </svg>
          {{ requirement }}
        </li>
      </ul>
    </div>

    <!-- Feedback -->
    <div v-if="strength.feedback.length > 0" class="mb-3">
      <h4 class="text-sm font-medium text-gray-700 mb-2">Suggestions :</h4>
      <ul class="space-y-1">
        <li 
          v-for="(feedback, index) in strength.feedback" 
          :key="index"
          class="text-xs text-amber-600 flex items-start"
        >
          <svg class="w-3 h-3 mr-2 mt-0.5 text-amber-500" fill="currentColor" viewBox="0 0 20 20">
            <path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd" />
          </svg>
          {{ feedback }}
        </li>
      </ul>
    </div>

    <!-- Score numérique (optionnel) -->
    <div v-if="showScore" class="text-xs text-gray-500">
      Score de sécurité : {{ strength.score }}/10
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { evaluatePasswordStrength } from '@/composables/usePasswordValidation'

interface Props {
  password: string
  showScore?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showScore: false
})

// Évaluer la force du mot de passe
const strength = computed(() => evaluatePasswordStrength(props.password))

// Couleurs selon le niveau de force
const strengthColorClass = computed(() => {
  switch (strength.value.level) {
    case 'très faible': return 'text-red-600'
    case 'faible': return 'text-orange-600'
    case 'moyen': return 'text-yellow-600'
    case 'fort': return 'text-blue-600'
    case 'très fort': return 'text-green-600'
    default: return 'text-gray-600'
  }
})

// Couleurs de la barre de progression
const strengthBarClass = computed(() => {
  switch (strength.value.level) {
    case 'très faible': return 'bg-red-500'
    case 'faible': return 'bg-orange-500'
    case 'moyen': return 'bg-yellow-500'
    case 'fort': return 'bg-blue-500'
    case 'très fort': return 'bg-green-500'
    default: return 'bg-gray-500'
  }
})

// Exigences CNIL
const requirements = [
  'Au moins 12 caractères',
  'Au moins une lettre minuscule (a-z)',
  'Au moins une lettre majuscule (A-Z)',
  'Au moins un chiffre (0-9)',
  'Au moins un symbole spécial (!@#$%^&*...)',
  'Pas de caractères répétés consécutifs',
  'Pas de séquences de caractères'
]

// Vérifier si une exigence est respectée
const requirementMet = (index: number): boolean => {
  const password = props.password
  
  switch (index) {
    case 0: // Longueur
      return password.length >= 12
    case 1: // Minuscules
      return /[a-z]/.test(password)
    case 2: // Majuscules
      return /[A-Z]/.test(password)
    case 3: // Chiffres
      return /[0-9]/.test(password)
    case 4: // Symboles
      return /[^a-zA-Z0-9]/.test(password)
    case 5: // Pas de répétitions
      return !/(.)\1{2,}/.test(password)
    case 6: // Pas de séquences
      const sequences = ['123', '234', '345', '456', '567', '678', '789', '012', 'abc', 'bcd', 'cde', 'def', 'efg', 'fgh', 'ghi', 'hij', 'ijk', 'jkl', 'klm', 'lmn', 'mno', 'nop', 'opq', 'pqr', 'qrs', 'rst', 'stu', 'tuv', 'uvw', 'vwx', 'wxy', 'xyz']
      return !sequences.some(seq => password.toLowerCase().includes(seq))
    default:
      return false
  }
}
</script>

<style scoped>
.password-strength-meter {
  @apply p-4 bg-gray-50 rounded-lg border;
}
</style> 