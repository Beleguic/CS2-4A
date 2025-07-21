<template>
  <div class="alert-badge-container">
    <!-- Badge principal -->
    <div 
      class="alert-badge"
      :class="[
        `alert-badge-${variant}`,
        { 'alert-badge-pulse': pulse && unreadCount > 0 }
      ]"
      @click="handleClick"
    >
      <!-- Icône -->
      <div class="alert-badge-icon">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-5 5v-5zM4.19 4.19A2 2 0 006 3h12a2 2 0 012 2v12a2 2 0 01-2 2H6a2 2 0 01-2-2V5a2 2 0 012-2z" />
        </svg>
      </div>
      
      <!-- Compteur -->
      <div v-if="showCount && unreadCount > 0" class="alert-badge-count">
        <span class="alert-badge-number">
          {{ formatCount(unreadCount) }}
        </span>
      </div>
      
      <!-- Indicateur de point -->
      <div v-else-if="unreadCount > 0" class="alert-badge-dot"></div>
    </div>
    
    <!-- Tooltip -->
    <div 
      v-if="showTooltip && unreadCount > 0"
      class="alert-badge-tooltip"
      :class="`alert-badge-tooltip-${tooltipPosition}`"
    >
      <div class="tooltip-content">
        <div class="tooltip-header">
          <span class="tooltip-title">Alertes non lues</span>
          <span class="tooltip-count">{{ unreadCount }}</span>
        </div>
        
        <div v-if="recentAlerts.length > 0" class="tooltip-alerts">
          <div 
            v-for="alert in recentAlerts.slice(0, 3)" 
            :key="alert.id"
            class="tooltip-alert-item"
          >
            <div class="tooltip-alert-icon">
              <component :is="getAlertIcon(alert.type)" class="w-3 h-3" />
            </div>
            <div class="tooltip-alert-content">
              <span class="tooltip-alert-title">{{ alert.title }}</span>
              <span class="tooltip-alert-time">{{ formatTime(alert.createdAt) }}</span>
            </div>
          </div>
        </div>
        
        <div class="tooltip-footer">
          <button @click="viewAllAlerts" class="tooltip-action">
            Voir toutes les alertes
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'

// Props
interface Alert {
  id: string
  type: string
  title: string
  createdAt: string
}

interface Props {
  unreadCount: number
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'danger'
  showCount?: boolean
  showTooltip?: boolean
  tooltipPosition?: 'top' | 'bottom' | 'left' | 'right'
  pulse?: boolean
  recentAlerts?: Alert[]
  maxCount?: number
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
  showCount: true,
  showTooltip: false,
  tooltipPosition: 'bottom',
  pulse: true,
  recentAlerts: () => [],
  maxCount: 99
})

// Emits
const emit = defineEmits<{
  click: []
  'view-all': []
}>()

// État local
const isHovered = ref(false)

// Computed
const formattedCount = computed(() => {
  return props.unreadCount > props.maxCount ? `${props.maxCount}+` : props.unreadCount.toString()
})

// Méthodes
const formatCount = (count: number): string => {
  if (count > props.maxCount) {
    return `${props.maxCount}+`
  }
  return count.toString()
}

const getAlertIcon = (type: string): string => {
  const icons = {
    newsletter: 'MailIcon',
    new_products: 'SparklesIcon',
    promotions: 'GiftIcon',
    restock: 'PackageIcon',
    price_change: 'TrendingUpIcon'
  }
  
  return icons[type as keyof typeof icons] || 'BellIcon'
}

const formatTime = (dateString: string): string => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'À l\'instant'
  if (diffInMinutes < 60) return `Il y a ${diffInMinutes} min`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `Il y a ${diffInHours}h`
  
  const diffInDays = Math.floor(diffInHours / 24)
  if (diffInDays < 7) return `Il y a ${diffInDays}j`
  
  return date.toLocaleDateString('fr-FR', { 
    day: 'numeric', 
    month: 'short' 
  })
}

const handleClick = () => {
  emit('click')
}

const viewAllAlerts = () => {
  emit('view-all')
}

// Gestion du hover pour le tooltip
const handleMouseEnter = () => {
  if (props.showTooltip) {
    isHovered.value = true
  }
}

const handleMouseLeave = () => {
  if (props.showTooltip) {
    isHovered.value = false
  }
}

// Lifecycle
onMounted(() => {
  // Ajouter les event listeners si nécessaire
})

onUnmounted(() => {
  // Nettoyer les event listeners si nécessaire
})
</script>

<style scoped>
.alert-badge-container {
  position: relative;
  display: inline-block;
}

.alert-badge {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 50%;
  width: 2.5rem;
  height: 2.5rem;
  background: white;
  border: 2px solid #e5e7eb;
  color: #6b7280;
}

.alert-badge:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Variantes */
.alert-badge-default {
  border-color: #e5e7eb;
  color: #6b7280;
}

.alert-badge-primary {
  border-color: #696BE2;
  color: #696BE2;
}

.alert-badge-success {
  border-color: #10b981;
  color: #10b981;
}

.alert-badge-warning {
  border-color: #f59e0b;
  color: #f59e0b;
}

.alert-badge-danger {
  border-color: #ef4444;
  color: #ef4444;
}

/* Animation de pulsation */
.alert-badge-pulse {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(105, 107, 226, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(105, 107, 226, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(105, 107, 226, 0);
  }
}

/* Icône */
.alert-badge-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Compteur */
.alert-badge-count {
  position: absolute;
  top: -0.5rem;
  right: -0.5rem;
  background: #ef4444;
  color: white;
  border-radius: 50%;
  min-width: 1.25rem;
  height: 1.25rem;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 600;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.alert-badge-number {
  line-height: 1;
}

/* Point indicateur */
.alert-badge-dot {
  position: absolute;
  top: -0.25rem;
  right: -0.25rem;
  width: 0.75rem;
  height: 0.75rem;
  background: #ef4444;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

/* Tooltip */
.alert-badge-tooltip {
  position: absolute;
  z-index: 50;
  opacity: 0;
  visibility: hidden;
  transition: all 0.2s ease;
  pointer-events: none;
}

.alert-badge-container:hover .alert-badge-tooltip {
  opacity: 1;
  visibility: visible;
  pointer-events: auto;
}

/* Positions du tooltip */
.alert-badge-tooltip-top {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-0.5rem);
}

.alert-badge-tooltip-bottom {
  top: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(0.5rem);
}

.alert-badge-tooltip-left {
  right: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(-0.5rem);
}

.alert-badge-tooltip-right {
  left: 100%;
  top: 50%;
  transform: translateY(-50%) translateX(0.5rem);
}

.tooltip-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  border: 1px solid #e5e7eb;
  padding: 1rem;
  min-width: 280px;
  max-width: 320px;
}

.tooltip-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid #f3f4f6;
}

.tooltip-title {
  font-weight: 600;
  color: #111827;
  font-size: 0.875rem;
}

.tooltip-count {
  background: #696BE2;
  color: white;
  padding: 0.25rem 0.5rem;
  border-radius: 12px;
  font-size: 0.75rem;
  font-weight: 600;
}

.tooltip-alerts {
  margin-bottom: 0.75rem;
}

.tooltip-alert-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0;
  border-bottom: 1px solid #f9fafb;
}

.tooltip-alert-item:last-child {
  border-bottom: none;
}

.tooltip-alert-icon {
  flex-shrink: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f3f4f6;
  border-radius: 4px;
  color: #6b7280;
}

.tooltip-alert-content {
  flex: 1;
  min-width: 0;
}

.tooltip-alert-title {
  display: block;
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 0.125rem;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.tooltip-alert-time {
  display: block;
  font-size: 0.75rem;
  color: #6b7280;
}

.tooltip-footer {
  padding-top: 0.75rem;
  border-top: 1px solid #f3f4f6;
}

.tooltip-action {
  width: 100%;
  padding: 0.5rem;
  background: #696BE2;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s ease;
}

.tooltip-action:hover {
  background: #5a5cd1;
}

/* Responsive */
@media (max-width: 640px) {
  .alert-badge {
    width: 2rem;
    height: 2rem;
  }
  
  .alert-badge-icon {
    width: 1rem;
    height: 1rem;
  }
  
  .tooltip-content {
    min-width: 240px;
    max-width: 280px;
  }
}

/* Flèche du tooltip */
.alert-badge-tooltip::before {
  content: '';
  position: absolute;
  width: 0;
  height: 0;
  border: 6px solid transparent;
}

.alert-badge-tooltip-top::before {
  top: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-top-color: white;
}

.alert-badge-tooltip-bottom::before {
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  border-bottom-color: white;
}

.alert-badge-tooltip-left::before {
  left: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-left-color: white;
}

.alert-badge-tooltip-right::before {
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  border-right-color: white;
}
</style> 