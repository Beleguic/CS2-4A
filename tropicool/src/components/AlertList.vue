<template>
  <div class="alert-list-container">
    <!-- En-tête avec filtres -->
    <div class="alert-list-header">
      <div class="header-left">
        <h3 class="alert-list-title">
          🔔 Mes Alertes ({{ filteredAlerts.length }})
        </h3>
        <p class="alert-list-subtitle">
          Gérez vos notifications et alertes personnalisées
        </p>
      </div>
      
      <div class="header-actions">
        <button
          @click="markAllAsRead"
          :disabled="!hasUnreadAlerts"
          class="action-btn secondary"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
          </svg>
          Tout marquer comme lu
        </button>
        
        <button
          @click="clearAllAlerts"
          :disabled="alerts.length === 0"
          class="action-btn danger"
        >
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Tout effacer
        </button>
      </div>
    </div>

    <!-- Filtres -->
    <div class="alert-filters">
      <div class="filter-group">
        <label class="filter-label">Type d'alerte :</label>
        <select v-model="selectedType" class="filter-select">
          <option value="">Tous les types</option>
          <option value="newsletter">Newsletter</option>
          <option value="new_products">Nouveaux produits</option>
          <option value="promotions">Promotions</option>
          <option value="restock">Réapprovisionnement</option>
          <option value="price_change">Changement de prix</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Statut :</label>
        <select v-model="selectedStatus" class="filter-select">
          <option value="">Tous</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Période :</label>
        <select v-model="selectedPeriod" class="filter-select">
          <option value="">Toute la période</option>
          <option value="today">Aujourd'hui</option>
          <option value="week">Cette semaine</option>
          <option value="month">Ce mois</option>
        </select>
      </div>
      
      <div class="filter-group">
        <label class="filter-label">Recherche :</label>
        <input
          v-model="searchQuery"
          type="text"
          placeholder="Rechercher dans les alertes..."
          class="filter-input"
        />
      </div>
    </div>

    <!-- Liste des alertes -->
    <div class="alert-list-content">
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner"></div>
        <p>Chargement des alertes...</p>
      </div>
      
      <div v-else-if="filteredAlerts.length === 0" class="empty-state">
        <div class="empty-icon">🔔</div>
        <h4>Aucune alerte trouvée</h4>
        <p>
          {{ getEmptyStateMessage() }}
        </p>
        <button @click="refreshAlerts" class="action-btn primary">
          Actualiser
        </button>
      </div>
      
      <div v-else class="alerts-grid">
        <AlertNotification
          v-for="alert in paginatedAlerts"
          :key="alert.id"
          :id="alert.id"
          :type="getAlertType(alert)"
          :title="alert.title"
          :message="alert.message"
          :dismissible="true"
          :auto-dismiss="false"
          :actions="getAlertActions(alert)"
          @dismiss="handleAlertDismiss"
          @action="handleAlertAction"
        />
      </div>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="alert-pagination">
      <button
        @click="previousPage"
        :disabled="currentPage === 1"
        class="pagination-btn"
      >
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Précédent
      </button>
      
      <div class="pagination-info">
        Page {{ currentPage }} sur {{ totalPages }}
      </div>
      
      <button
        @click="nextPage"
        :disabled="currentPage === totalPages"
        class="pagination-btn"
      >
        Suivant
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import AlertNotification from './AlertNotification.vue'

// Props
interface Alert {
  id: string
  type: string
  title: string
  message: string
  isRead: boolean
  createdAt: string
  category?: string
  product?: string
  actions?: any[]
}

interface Props {
  alerts: Alert[]
  isLoading?: boolean
  itemsPerPage?: number
}

const props = withDefaults(defineProps<Props>(), {
  isLoading: false,
  itemsPerPage: 10
})

// Emits
const emit = defineEmits<{
  'update:alerts': [alerts: Alert[]]
  dismiss: [alertId: string]
  action: [alertId: string, action: any]
  'mark-all-read': []
  'clear-all': []
  refresh: []
}>()

// État local
const selectedType = ref('')
const selectedStatus = ref('')
const selectedPeriod = ref('')
const searchQuery = ref('')
const currentPage = ref(1)

// Computed
const filteredAlerts = computed(() => {
  let filtered = [...props.alerts]
  
  // Filtre par type
  if (selectedType.value) {
    filtered = filtered.filter(alert => alert.type === selectedType.value)
  }
  
  // Filtre par statut
  if (selectedStatus.value) {
    filtered = filtered.filter(alert => {
      if (selectedStatus.value === 'unread') return !alert.isRead
      if (selectedStatus.value === 'read') return alert.isRead
      return true
    })
  }
  
  // Filtre par période
  if (selectedPeriod.value) {
    const now = new Date()
    const alertDate = new Date()
    
    filtered = filtered.filter(alert => {
      alertDate.setTime(new Date(alert.createdAt).getTime())
      
      switch (selectedPeriod.value) {
        case 'today':
          return alertDate.toDateString() === now.toDateString()
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          return alertDate >= weekAgo
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
          return alertDate >= monthAgo
        default:
          return true
      }
    })
  }
  
  // Filtre par recherche
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(alert => 
      alert.title.toLowerCase().includes(query) ||
      alert.message.toLowerCase().includes(query) ||
      (alert.category && alert.category.toLowerCase().includes(query)) ||
      (alert.product && alert.product.toLowerCase().includes(query))
    )
  }
  
  return filtered
})

const totalPages = computed(() => {
  return Math.ceil(filteredAlerts.value.length / props.itemsPerPage)
})

const paginatedAlerts = computed(() => {
  const start = (currentPage.value - 1) * props.itemsPerPage
  const end = start + props.itemsPerPage
  return filteredAlerts.value.slice(start, end)
})

const hasUnreadAlerts = computed(() => {
  return props.alerts.some(alert => !alert.isRead)
})

// Méthodes
const getAlertType = (alert: Alert): string => {
  const typeMap: Record<string, string> = {
    newsletter: 'info',
    new_products: 'new-product',
    promotions: 'promotion',
    restock: 'restock',
    price_change: 'warning'
  }
  
  return typeMap[alert.type] || 'info'
}

const getAlertActions = (alert: Alert) => {
  const actions = []
  
  if (!alert.isRead) {
    actions.push({
      id: 'mark-read',
      label: 'Marquer comme lu',
      type: 'secondary',
      handler: () => markAlertAsRead(alert.id)
    })
  }
  
  if (alert.type === 'new_products' || alert.type === 'promotions') {
    actions.push({
      id: 'view',
      label: 'Voir plus',
      type: 'primary',
      handler: () => viewAlertDetails(alert)
    })
  }
  
  if (alert.type === 'restock') {
    actions.push({
      id: 'add-to-cart',
      label: 'Ajouter au panier',
      type: 'success',
      handler: () => addToCart(alert)
    })
  }
  
  return actions
}

const handleAlertDismiss = (alertId: string) => {
  emit('dismiss', alertId)
}

const handleAlertAction = (action: any) => {
  // L'action sera gérée par le composant parent
  console.log('Action triggered:', action)
}

const markAlertAsRead = (alertId: string) => {
  const updatedAlerts = props.alerts.map(alert => 
    alert.id === alertId ? { ...alert, isRead: true } : alert
  )
  emit('update:alerts', updatedAlerts)
}

const markAllAsRead = () => {
  emit('mark-all-read')
}

const clearAllAlerts = () => {
  emit('clear-all')
}

const refreshAlerts = () => {
  emit('refresh')
}

const viewAlertDetails = (alert: Alert) => {
  // Navigation vers les détails selon le type d'alerte
  console.log('View alert details:', alert)
}

const addToCart = (alert: Alert) => {
  // Ajouter le produit au panier
  console.log('Add to cart:', alert)
}

const previousPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--
  }
}

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++
  }
}

const getEmptyStateMessage = () => {
  if (selectedType.value || selectedStatus.value || selectedPeriod.value || searchQuery.value) {
    return 'Aucune alerte ne correspond à vos critères de recherche. Essayez de modifier vos filtres.'
  }
  return 'Vous n\'avez pas encore d\'alertes. Configurez vos préférences pour recevoir des notifications personnalisées.'
}

// Watchers
watch([selectedType, selectedStatus, selectedPeriod, searchQuery], () => {
  currentPage.value = 1
})

// Lifecycle
onMounted(() => {
  // Initialisation si nécessaire
})
</script>

<style scoped>
.alert-list-container {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

/* En-tête */
.alert-list-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.header-left {
  flex: 1;
}

.alert-list-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.alert-list-subtitle {
  color: #6b7280;
  margin: 0;
  font-size: 0.875rem;
}

.header-actions {
  display: flex;
  gap: 0.75rem;
  flex-shrink: 0;
}

.action-btn {
  display: inline-flex;
  align-items: center;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
}

.action-btn.primary {
  background: #696BE2;
  color: white;
}

.action-btn.primary:hover {
  background: #5a5cd1;
}

.action-btn.secondary {
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
}

.action-btn.secondary:hover {
  background: #e5e7eb;
}

.action-btn.danger {
  background: #ef4444;
  color: white;
}

.action-btn.danger:hover {
  background: #dc2626;
}

.action-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Filtres */
.alert-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.filter-select,
.filter-input {
  padding: 0.5rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  background: white;
  transition: border-color 0.2s ease;
}

.filter-select:focus,
.filter-input:focus {
  outline: none;
  border-color: #696BE2;
  box-shadow: 0 0 0 3px rgba(105, 107, 226, 0.1);
}

/* Contenu */
.alert-list-content {
  padding: 1.5rem;
  min-height: 200px;
}

.loading-state,
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem 1rem;
  text-align: center;
}

.loading-spinner {
  width: 2rem;
  height: 2rem;
  border: 2px solid #e5e7eb;
  border-top: 2px solid #696BE2;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 1rem;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.empty-icon {
  font-size: 3rem;
  margin-bottom: 1rem;
  opacity: 0.5;
}

.empty-state h4 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #374151;
  margin: 0 0 0.5rem 0;
}

.empty-state p {
  color: #6b7280;
  margin: 0 0 1.5rem 0;
  max-width: 400px;
  line-height: 1.5;
}

.alerts-grid {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

/* Pagination */
.alert-pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-top: 1px solid #e5e7eb;
  background: #f9fafb;
}

.pagination-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  background: white;
  color: #374151;
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pagination-btn:hover:not(:disabled) {
  background: #f3f4f6;
  border-color: #9ca3af;
}

.pagination-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.pagination-info {
  font-size: 0.875rem;
  color: #6b7280;
  font-weight: 500;
}

/* Responsive */
@media (max-width: 768px) {
  .alert-list-header {
    flex-direction: column;
    gap: 1rem;
    align-items: stretch;
  }
  
  .header-actions {
    justify-content: flex-start;
  }
  
  .alert-filters {
    grid-template-columns: 1fr;
  }
  
  .alert-pagination {
    flex-direction: column;
    gap: 0.75rem;
  }
}
</style> 