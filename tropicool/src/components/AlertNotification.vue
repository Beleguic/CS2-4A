<template>
  <div 
    v-if="isVisible"
    :class="[
      'alert-notification',
      `alert-${type}`,
      { 'alert-dismissible': dismissible }
    ]"
    role="alert"
  >
    <!-- Icône -->
    <div class="alert-icon">
      <component :is="iconComponent" class="w-5 h-5" />
    </div>
    
    <!-- Contenu -->
    <div class="alert-content">
      <h4 v-if="title" class="alert-title">
        {{ title }}
      </h4>
      <p class="alert-message">
        {{ message }}
      </p>
      
      <!-- Actions -->
      <div v-if="actions && actions.length > 0" class="alert-actions">
        <button
          v-for="action in actions"
          :key="action.id"
          @click="handleAction(action)"
          :class="[
            'alert-action-btn',
            `alert-action-${action.type || 'secondary'}`
          ]"
          :disabled="action.disabled"
        >
          <component v-if="action.icon" :is="action.icon" class="w-4 h-4 mr-2" />
          {{ action.label }}
        </button>
      </div>
    </div>
    
    <!-- Bouton de fermeture -->
    <button
      v-if="dismissible"
      @click="dismiss"
      class="alert-dismiss-btn"
      :aria-label="dismissLabel"
    >
      <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
      </svg>
    </button>
    
    <!-- Barre de progression pour auto-dismiss -->
    <div
      v-if="autoDismiss && dismissible"
      class="alert-progress"
      :style="{ animationDuration: `${autoDismissDelay}ms` }"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface AlertAction {
  id: string
  label: string
  type?: 'primary' | 'secondary' | 'danger' | 'success'
  icon?: any
  disabled?: boolean
  handler?: () => void | Promise<void>
}

interface Props {
  id?: string
  type?: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'restock' | 'new-product'
  title?: string
  message: string
  dismissible?: boolean
  autoDismiss?: boolean
  autoDismissDelay?: number
  actions?: AlertAction[]
  dismissLabel?: string
}

const props = withDefaults(defineProps<Props>(), {
  type: 'info',
  dismissible: true,
  autoDismiss: false,
  autoDismissDelay: 5000,
  dismissLabel: 'Fermer la notification'
})

// Emits
const emit = defineEmits<{
  dismiss: [id?: string]
  action: [action: AlertAction]
}>()

// État local
const isVisible = ref(true)
let autoDismissTimer: NodeJS.Timeout | null = null

// Computed
const iconComponent = computed(() => {
  const icons = {
    info: 'InfoIcon',
    success: 'CheckCircleIcon',
    warning: 'ExclamationTriangleIcon',
    error: 'XCircleIcon',
    promotion: 'GiftIcon',
    restock: 'PackageIcon',
    'new-product': 'SparklesIcon'
  }
  
  return icons[props.type] || icons.info
})

// Méthodes
const dismiss = () => {
  isVisible.value = false
  emit('dismiss', props.id)
}

const handleAction = async (action: AlertAction) => {
  if (action.disabled) return
  
  emit('action', action)
  
  if (action.handler) {
    try {
      await action.handler()
    } catch (error) {
      console.error('Erreur lors de l\'exécution de l\'action:', error)
    }
  }
}

// Auto-dismiss
const startAutoDismiss = () => {
  if (props.autoDismiss && props.dismissible) {
    autoDismissTimer = setTimeout(() => {
      dismiss()
    }, props.autoDismissDelay)
  }
}

const stopAutoDismiss = () => {
  if (autoDismissTimer) {
    clearTimeout(autoDismissTimer)
    autoDismissTimer = null
  }
}

// Lifecycle
onMounted(() => {
  startAutoDismiss()
})

onUnmounted(() => {
  stopAutoDismiss()
})
</script>

<style scoped>
.alert-notification {
  position: relative;
  display: flex;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid;
  margin-bottom: 1rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  overflow: hidden;
}

.alert-notification:hover {
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* Types d'alertes */
.alert-info {
  background-color: #eff6ff;
  border-color: #bfdbfe;
  color: #1e40af;
}

.alert-success {
  background-color: #f0fdf4;
  border-color: #bbf7d0;
  color: #166534;
}

.alert-warning {
  background-color: #fffbeb;
  border-color: #fed7aa;
  color: #92400e;
}

.alert-error {
  background-color: #fef2f2;
  border-color: #fecaca;
  color: #dc2626;
}

.alert-promotion {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-color: #667eea;
  color: white;
}

.alert-restock {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  border-color: #f093fb;
  color: white;
}

.alert-new-product {
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  border-color: #4facfe;
  color: white;
}

/* Icône */
.alert-icon {
  flex-shrink: 0;
  margin-right: 0.75rem;
  margin-top: 0.125rem;
}

/* Contenu */
.alert-content {
  flex: 1;
  min-width: 0;
}

.alert-title {
  font-weight: 600;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  line-height: 1.4;
}

.alert-message {
  margin: 0;
  line-height: 1.5;
  font-size: 0.875rem;
}

/* Actions */
.alert-actions {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.75rem;
  flex-wrap: wrap;
}

.alert-action-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  text-decoration: none;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;
}

.alert-action-primary {
  background-color: currentColor;
  color: white;
}

.alert-action-primary:hover {
  opacity: 0.9;
}

.alert-action-secondary {
  background-color: rgba(255, 255, 255, 0.2);
  color: currentColor;
  border: 1px solid rgba(255, 255, 255, 0.3);
}

.alert-action-secondary:hover {
  background-color: rgba(255, 255, 255, 0.3);
}

.alert-action-danger {
  background-color: #dc2626;
  color: white;
}

.alert-action-danger:hover {
  background-color: #b91c1c;
}

.alert-action-success {
  background-color: #16a34a;
  color: white;
}

.alert-action-success:hover {
  background-color: #15803d;
}

.alert-action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Bouton de fermeture */
.alert-dismiss-btn {
  flex-shrink: 0;
  margin-left: 0.75rem;
  padding: 0.25rem;
  background: none;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  opacity: 0.7;
  transition: opacity 0.2s ease;
  color: currentColor;
}

.alert-dismiss-btn:hover {
  opacity: 1;
  background-color: rgba(255, 255, 255, 0.1);
}

/* Barre de progression */
.alert-progress {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 3px;
  background-color: rgba(255, 255, 255, 0.3);
  animation: progress-shrink linear forwards;
}

@keyframes progress-shrink {
  from {
    width: 100%;
  }
  to {
    width: 0%;
  }
}

/* Responsive */
@media (max-width: 640px) {
  .alert-notification {
    flex-direction: column;
    align-items: stretch;
  }
  
  .alert-icon {
    margin-right: 0;
    margin-bottom: 0.5rem;
    align-self: flex-start;
  }
  
  .alert-actions {
    flex-direction: column;
  }
  
  .alert-action-btn {
    justify-content: center;
  }
  
  .alert-dismiss-btn {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    margin-left: 0;
  }
}

/* Animations d'entrée/sortie */
.alert-notification {
  animation: slide-in 0.3s ease-out;
}

@keyframes slide-in {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.alert-notification.alert-exit {
  animation: slide-out 0.3s ease-in forwards;
}

@keyframes slide-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(-10px);
  }
}
</style> 