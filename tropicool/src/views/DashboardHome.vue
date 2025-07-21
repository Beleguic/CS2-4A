<template>
  <div class="dashboard-home">
    <!-- Header avec titre et actions -->
    <div class="dashboard-header">
      <div class="header-content">
        <h1 class="dashboard-title">Tableau de Bord</h1>
        <div class="header-actions">
          <button @click="refreshData" class="refresh-btn" :disabled="isLoading">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
            </svg>
            Actualiser
          </button>
          <button @click="toggleWidgetSettings" class="settings-btn">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
            Personnaliser
          </button>
          <button @click="toggleEditMode" class="edit-btn" :class="{ 'active': isEditMode }">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>
            </svg>
            {{ isEditMode ? 'Terminer' : 'Éditer' }}
          </button>
        </div>
      </div>
      <p class="dashboard-subtitle">Vue d'ensemble de votre activité e-commerce</p>
    </div>

    <!-- KPI Cards -->
    <div class="kpi-grid">
      <div class="kpi-card" v-for="kpi in kpis" :key="kpi.id">
        <div class="kpi-icon" :class="kpi.color">
          <component :is="kpi.icon" class="w-6 h-6" />
        </div>
        <div class="kpi-content">
          <h3 class="kpi-title">{{ kpi.title }}</h3>
          <p class="kpi-value">{{ kpi.value }}</p>
          <p class="kpi-change" :class="kpi.trend">
            {{ kpi.change }}
            <span class="kpi-period">vs mois dernier</span>
          </p>
        </div>
      </div>
    </div>

    <!-- Widgets Grid avec Drag & Drop -->
    <div class="widgets-container">
      <div ref="widgetsGrid" class="widgets-grid" :class="{ 'edit-mode': isEditMode }">
        <!-- Widget Ventes par Période -->
        <div 
          class="widget-card" 
          v-if="visibleWidgets.includes('sales')"
          :data-widget-id="'sales'"
          :style="getWidgetStyle('sales')"
        >
          <div class="widget-header">
            <div class="widget-drag-handle" v-if="isEditMode">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
            </div>
            <h3 class="widget-title">Ventes par Période</h3>
            <div class="widget-actions">
              <select v-model="salesPeriod" @change="updateSalesChart" class="period-select">
                <option value="7">7 jours</option>
                <option value="30">30 jours</option>
                <option value="90">90 jours</option>
              </select>
              <button @click="removeWidget('sales')" class="remove-widget-btn" v-if="isEditMode">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="widget-content">
            <canvas ref="salesChart" class="chart-canvas"></canvas>
          </div>
          <!-- Poignées de redimensionnement -->
          <div v-if="isEditMode" class="resize-handles">
            <div class="resize-handle resize-handle-nw" @mousedown="startResize('sales', 'nw')"></div>
            <div class="resize-handle resize-handle-ne" @mousedown="startResize('sales', 'ne')"></div>
            <div class="resize-handle resize-handle-sw" @mousedown="startResize('sales', 'sw')"></div>
            <div class="resize-handle resize-handle-se" @mousedown="startResize('sales', 'se')"></div>
          </div>
        </div>

        <!-- Widget Produits les Plus Vendus -->
        <div 
          class="widget-card" 
          v-if="visibleWidgets.includes('topProducts')"
          :data-widget-id="'topProducts'"
          :style="getWidgetStyle('topProducts')"
        >
          <div class="widget-header">
            <div class="widget-drag-handle" v-if="isEditMode">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
            </div>
            <h3 class="widget-title">Produits les Plus Vendus</h3>
            <div class="widget-actions">
              <button @click="removeWidget('topProducts')" class="remove-widget-btn" v-if="isEditMode">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="widget-content">
            <canvas ref="topProductsChart" class="chart-canvas"></canvas>
          </div>
          <!-- Poignées de redimensionnement -->
          <div v-if="isEditMode" class="resize-handles">
            <div class="resize-handle resize-handle-nw" @mousedown="startResize('topProducts', 'nw')"></div>
            <div class="resize-handle resize-handle-ne" @mousedown="startResize('topProducts', 'ne')"></div>
            <div class="resize-handle resize-handle-sw" @mousedown="startResize('topProducts', 'sw')"></div>
            <div class="resize-handle resize-handle-se" @mousedown="startResize('topProducts', 'se')"></div>
          </div>
        </div>

        <!-- Widget Répartition des Commandes -->
        <div 
          class="widget-card" 
          v-if="visibleWidgets.includes('orderStatus')"
          :data-widget-id="'orderStatus'"
          :style="getWidgetStyle('orderStatus')"
        >
          <div class="widget-header">
            <div class="widget-drag-handle" v-if="isEditMode">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
            </div>
            <h3 class="widget-title">Répartition des Commandes</h3>
            <div class="widget-actions">
              <button @click="removeWidget('orderStatus')" class="remove-widget-btn" v-if="isEditMode">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="widget-content">
            <canvas ref="orderStatusChart" class="chart-canvas"></canvas>
          </div>
          <!-- Poignées de redimensionnement -->
          <div v-if="isEditMode" class="resize-handles">
            <div class="resize-handle resize-handle-nw" @mousedown="startResize('orderStatus', 'nw')"></div>
            <div class="resize-handle resize-handle-ne" @mousedown="startResize('orderStatus', 'ne')"></div>
            <div class="resize-handle resize-handle-sw" @mousedown="startResize('orderStatus', 'sw')"></div>
            <div class="resize-handle resize-handle-se" @mousedown="startResize('orderStatus', 'se')"></div>
          </div>
        </div>

        <!-- Widget Évolution des Stocks -->
        <div 
          class="widget-card" 
          v-if="visibleWidgets.includes('stockEvolution')"
          :data-widget-id="'stockEvolution'"
          :style="getWidgetStyle('stockEvolution')"
        >
          <div class="widget-header">
            <div class="widget-drag-handle" v-if="isEditMode">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
              </svg>
            </div>
            <h3 class="widget-title">Évolution des Stocks</h3>
            <div class="widget-actions">
              <button @click="removeWidget('stockEvolution')" class="remove-widget-btn" v-if="isEditMode">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
          <div class="widget-content">
            <canvas ref="stockEvolutionChart" class="chart-canvas"></canvas>
          </div>
          <!-- Poignées de redimensionnement -->
          <div v-if="isEditMode" class="resize-handles">
            <div class="resize-handle resize-handle-nw" @mousedown="startResize('stockEvolution', 'nw')"></div>
            <div class="resize-handle resize-handle-ne" @mousedown="startResize('stockEvolution', 'ne')"></div>
            <div class="resize-handle resize-handle-sw" @mousedown="startResize('stockEvolution', 'sw')"></div>
            <div class="resize-handle resize-handle-se" @mousedown="startResize('stockEvolution', 'se')"></div>
          </div>
        </div>
      </div>
    </div>

    <!-- Widget Settings Modal -->
    <div v-if="showWidgetSettings" class="modal-overlay" @click="closeWidgetSettings">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h3 class="modal-title">Personnaliser le Dashboard</h3>
          <button @click="closeWidgetSettings" class="modal-close">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="widget-settings">
            <h4 class="settings-subtitle">Widgets Visibles</h4>
            <div class="widget-options">
              <label v-for="widget in availableWidgets" :key="widget.id" class="widget-option">
                <input 
                  type="checkbox" 
                  :value="widget.id" 
                  v-model="visibleWidgets"
                  @change="saveWidgetPreferences"
                >
                <span class="widget-option-label">{{ widget.name }}</span>
              </label>
            </div>
            
            <h4 class="settings-subtitle">Paramètres Avancés</h4>
            <div class="advanced-settings">
              <div class="setting-group">
                <label class="setting-label">Mode d'édition</label>
                <p class="setting-description">Activez le mode d'édition pour réorganiser et redimensionner les widgets</p>
                <button @click="toggleEditMode" class="setting-btn" :class="{ 'active': isEditMode }">
                  {{ isEditMode ? 'Mode édition actif' : 'Activer le mode édition' }}
                </button>
              </div>
              
              <div class="setting-group">
                <label class="setting-label">Sauvegarde automatique</label>
                <p class="setting-description">Sauvegarde automatique des préférences utilisateur</p>
                <label class="toggle-switch">
                  <input type="checkbox" v-model="autoSave" @change="saveAdvancedPreferences">
                  <span class="toggle-slider"></span>
                </label>
              </div>
              
              <div class="setting-group">
                <label class="setting-label">Grille par défaut</label>
                <p class="setting-description">Nombre de colonnes par défaut pour les widgets</p>
                <select v-model="defaultGridColumns" @change="saveAdvancedPreferences" class="grid-select">
                  <option value="1">1 colonne</option>
                  <option value="2">2 colonnes</option>
                  <option value="3">3 colonnes</option>
                  <option value="4">4 colonnes</option>
                </select>
              </div>
            </div>
            
            <div class="settings-actions">
              <button @click="resetToDefault" class="reset-btn">Réinitialiser aux valeurs par défaut</button>
              <button @click="exportPreferences" class="export-btn">Exporter les préférences</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading Overlay -->
    <div v-if="isLoading" class="loading-overlay">
      <div class="loading-spinner">
        <svg class="animate-spin h-8 w-8" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        <span class="loading-text">Chargement des données...</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, nextTick, watch } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useToast } from 'vue-toast-notification'
import { useAuthStore } from '../stores/authStore'
import Sortable from 'sortablejs'

// Import des icônes SVG
import iconShoppingCart from '../assets/icons/shopping-cart.svg'
import iconEuro from '../assets/icons/euro.svg'
import iconPackage from '../assets/icons/package.svg'
import iconUsers from '../assets/icons/users.svg'

// Enregistrer les composants Chart.js
Chart.register(...registerables)

const $toast = useToast()
const authStore = useAuthStore()
const apiUrl = import.meta.env.VITE_API_URL

// États réactifs
const isLoading = ref(false)
const showWidgetSettings = ref(false)
const isEditMode = ref(false)
const salesPeriod = ref('30')
const autoSave = ref(true)
const defaultGridColumns = ref('2')

// Références des canvas
const salesChart = ref<HTMLCanvasElement>()
const topProductsChart = ref<HTMLCanvasElement>()
const orderStatusChart = ref<HTMLCanvasElement>()
const stockEvolutionChart = ref<HTMLCanvasElement>()
const widgetsGrid = ref<HTMLElement>()

// Instances des graphiques
let salesChartInstance: Chart | null = null
let topProductsChartInstance: Chart | null = null
let orderStatusChartInstance: Chart | null = null
let stockEvolutionChartInstance: Chart | null = null

// Instance Sortable pour le drag & drop
let sortableInstance: Sortable | null = null

// Widgets disponibles
const availableWidgets = ref([
  { id: 'sales', name: 'Ventes par Période' },
  { id: 'topProducts', name: 'Produits les Plus Vendus' },
  { id: 'orderStatus', name: 'Répartition des Commandes' },
  { id: 'stockEvolution', name: 'Évolution des Stocks' }
])

// Widgets visibles (avec sauvegarde locale)
const visibleWidgets = ref<string[]>(() => {
  const saved = localStorage.getItem('dashboard-widgets')
  return saved ? JSON.parse(saved) : ['sales', 'topProducts', 'orderStatus', 'stockEvolution']
})

// Positions et tailles des widgets
const widgetLayouts = ref<Record<string, { x: number; y: number; width: number; height: number }>>(() => {
  const saved = localStorage.getItem('dashboard-widget-layouts')
  return saved ? JSON.parse(saved) : {}
})

// Paramètres avancés
const advancedPreferences = ref(() => {
  const saved = localStorage.getItem('dashboard-advanced-preferences')
  return saved ? JSON.parse(saved) : {
    autoSave: true,
    defaultGridColumns: 2,
    editMode: false
  }
})

// KPI en temps réel
const kpis = ref([
  {
    id: 'orders',
    title: 'Commandes',
    value: '0',
    change: '+0%',
    trend: 'neutral',
    color: 'bg-blue-500',
    icon: iconShoppingCart
  },
  {
    id: 'revenue',
    title: 'Chiffre d\'Affaires',
    value: '0 €',
    change: '+0%',
    trend: 'neutral',
    color: 'bg-green-500',
    icon: iconEuro
  },
  {
    id: 'products',
    title: 'Produits',
    value: '0',
    change: '+0%',
    trend: 'neutral',
    color: 'bg-purple-500',
    icon: iconPackage
  },
  {
    id: 'users',
    title: 'Utilisateurs',
    value: '0',
    change: '+0%',
    trend: 'neutral',
    color: 'bg-orange-500',
    icon: iconUsers
  }
])

// Méthodes
const refreshData = async () => {
  isLoading.value = true
  try {
    await Promise.all([
      fetchKPIs(),
      fetchSalesData(),
      fetchTopProductsData(),
      fetchOrderStatusData(),
      fetchStockEvolutionData()
    ])
    $toast.open({
      message: 'Données actualisées avec succès',
      type: 'success',
      position: 'bottom-left'
    })
  } catch (error) {
    console.error('Erreur lors de l\'actualisation:', error)
    $toast.open({
      message: 'Erreur lors de l\'actualisation des données',
      type: 'error',
      position: 'bottom-left'
    })
  } finally {
    isLoading.value = false
  }
}

const fetchKPIs = async () => {
  try {
    // Simuler des données KPI (à remplacer par de vraies API)
    const mockKPIs = [
      { id: 'orders', value: '156', change: '+12%', trend: 'positive' },
      { id: 'revenue', value: '12,450 €', change: '+8%', trend: 'positive' },
      { id: 'products', value: '89', change: '+3%', trend: 'positive' },
      { id: 'users', value: '1,234', change: '+15%', trend: 'positive' }
    ]

    kpis.value = kpis.value.map(kpi => {
      const mock = mockKPIs.find(m => m.id === kpi.id)
      if (mock) {
        return { ...kpi, value: mock.value, change: mock.change, trend: mock.trend }
      }
      return kpi
    })
  } catch (error) {
    console.error('Erreur lors de la récupération des KPI:', error)
  }
}

const fetchSalesData = async () => {
  try {
    // Simuler des données de ventes
    const salesData = {
      labels: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
      datasets: [{
        label: 'Ventes (€)',
        data: [1200, 1900, 1500, 2100, 1800, 2500, 2200],
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        tension: 0.4
      }]
    }

    if (salesChart.value) {
      if (salesChartInstance) {
        salesChartInstance.destroy()
      }
      salesChartInstance = new Chart(salesChart.value, {
        type: 'line',
        data: salesData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de ventes:', error)
  }
}

const fetchTopProductsData = async () => {
  try {
    // Simuler des données de produits
    const productsData = {
      labels: ['Bière Tropicool', 'Cocktail Mango', 'Rhum Spécial', 'Tequila Gold', 'Whisky Premium'],
      datasets: [{
        label: 'Ventes',
        data: [45, 38, 32, 28, 25],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(139, 92, 246, 0.8)'
        ]
      }]
    }

    if (topProductsChart.value) {
      if (topProductsChartInstance) {
        topProductsChartInstance.destroy()
      }
      topProductsChartInstance = new Chart(topProductsChart.value, {
        type: 'bar',
        data: productsData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de produits:', error)
  }
}

const fetchOrderStatusData = async () => {
  try {
    // Simuler des données de statut de commandes
    const statusData = {
      labels: ['Livrées', 'En cours', 'En attente', 'Annulées'],
      datasets: [{
        data: [65, 20, 10, 5],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)'
        ]
      }]
    }

    if (orderStatusChart.value) {
      if (orderStatusChartInstance) {
        orderStatusChartInstance.destroy()
      }
      orderStatusChartInstance = new Chart(orderStatusChart.value, {
        type: 'doughnut',
        data: statusData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'bottom'
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de statut:', error)
  }
}

const fetchStockEvolutionData = async () => {
  try {
    // Simuler des données d'évolution des stocks
    const stockData = {
      labels: ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Juin'],
      datasets: [{
        label: 'Stock Moyen',
        data: [120, 135, 110, 145, 130, 155],
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true
      }]
    }

    if (stockEvolutionChart.value) {
      if (stockEvolutionChartInstance) {
        stockEvolutionChartInstance.destroy()
      }
      stockEvolutionChartInstance = new Chart(stockEvolutionChart.value, {
        type: 'line',
        data: stockData,
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: false
            }
          },
          scales: {
            y: {
              beginAtZero: true
            }
          }
        }
      })
    }
  } catch (error) {
    console.error('Erreur lors du chargement des données de stock:', error)
  }
}

const updateSalesChart = () => {
  fetchSalesData()
}

const toggleWidgetSettings = () => {
  showWidgetSettings.value = !showWidgetSettings.value
}

const closeWidgetSettings = () => {
  showWidgetSettings.value = false
}

const removeWidget = (widgetId: string) => {
  visibleWidgets.value = visibleWidgets.value.filter(id => id !== widgetId)
  saveWidgetPreferences()
}

const saveWidgetPreferences = () => {
  localStorage.setItem('dashboard-widgets', JSON.stringify(visibleWidgets.value))
}

const toggleEditMode = () => {
  isEditMode.value = !isEditMode.value
  if (isEditMode.value) {
    initializeSortable()
  } else {
    destroySortable()
  }
}

const initializeSortable = () => {
  if (widgetsGrid.value) {
    sortableInstance = new Sortable(widgetsGrid.value, {
      animation: 150,
      ghostClass: 'sortable-ghost',
      handle: '.widget-drag-handle',
      onEnd: (event) => {
        const widgetId = event.item.getAttribute('data-widget-id')
        if (widgetId) {
          saveLayoutPreferences()
          $toast.open({
            message: 'Widget réorganisé avec succès',
            type: 'success',
            position: 'bottom-left'
          })
        }
      }
    })
  }
}

const destroySortable = () => {
  if (sortableInstance) {
    sortableInstance.destroy()
    sortableInstance = null
  }
}

const startResize = (widgetId: string, handle: string) => {
  const widget = document.querySelector(`[data-widget-id="${widgetId}"]`) as HTMLElement
  if (!widget) return

  const startX = event?.clientX || 0
  const startY = event?.clientY || 0
  const startWidth = widget.offsetWidth
  const startHeight = widget.offsetHeight
  const startLeft = widget.offsetLeft
  const startTop = widget.offsetTop

  const onMouseMove = (e: MouseEvent) => {
    const deltaX = e.clientX - startX
    const deltaY = e.clientY - startY

    let newWidth = startWidth
    let newHeight = startHeight
    let newLeft = startLeft
    let newTop = startTop

    // Calculer les nouvelles dimensions selon la poignée
    switch (handle) {
      case 'se':
        newWidth = Math.max(200, startWidth + deltaX)
        newHeight = Math.max(200, startHeight + deltaY)
        break
      case 'sw':
        newWidth = Math.max(200, startWidth - deltaX)
        newHeight = Math.max(200, startHeight + deltaY)
        newLeft = startLeft + startWidth - newWidth
        break
      case 'ne':
        newWidth = Math.max(200, startWidth + deltaX)
        newHeight = Math.max(200, startHeight - deltaY)
        newTop = startTop + startHeight - newHeight
        break
      case 'nw':
        newWidth = Math.max(200, startWidth - deltaX)
        newHeight = Math.max(200, startHeight - deltaY)
        newLeft = startLeft + startWidth - newWidth
        newTop = startTop + startHeight - newHeight
        break
    }

    // Appliquer les nouvelles dimensions
    widget.style.width = `${newWidth}px`
    widget.style.height = `${newHeight}px`
    widget.style.left = `${newLeft}px`
    widget.style.top = `${newTop}px`

    // Mettre à jour le layout
    widgetLayouts.value[widgetId] = {
      x: newLeft,
      y: newTop,
      width: newWidth,
      height: newHeight
    }
  }

  const onMouseUp = () => {
    document.removeEventListener('mousemove', onMouseMove)
    document.removeEventListener('mouseup', onMouseUp)
    saveLayoutPreferences()
    $toast.open({
      message: 'Widget redimensionné avec succès',
      type: 'success',
      position: 'bottom-left'
    })
  }

  document.addEventListener('mousemove', onMouseMove)
  document.addEventListener('mouseup', onMouseUp)
}

const getWidgetStyle = (widgetId: string) => {
  const layout = widgetLayouts.value[widgetId]
  if (!layout) return {}

  return {
    position: 'absolute',
    left: `${layout.x}px`,
    top: `${layout.y}px`,
    width: `${layout.width}px`,
    height: `${layout.height}px`
  }
}

const saveLayoutPreferences = () => {
  if (autoSave.value) {
    localStorage.setItem('dashboard-widget-layouts', JSON.stringify(widgetLayouts.value))
  }
}

const saveAdvancedPreferences = () => {
  const preferences = {
    autoSave: autoSave.value,
    defaultGridColumns: parseInt(defaultGridColumns.value),
    editMode: isEditMode.value
  }
  localStorage.setItem('dashboard-advanced-preferences', JSON.stringify(preferences))
}

const resetToDefault = () => {
  visibleWidgets.value = ['sales', 'topProducts', 'orderStatus', 'stockEvolution']
  widgetLayouts.value = {}
  autoSave.value = true
  defaultGridColumns.value = '2'
  isEditMode.value = false
  
  saveWidgetPreferences()
  saveLayoutPreferences()
  saveAdvancedPreferences()
  
  $toast.open({
    message: 'Préférences réinitialisées aux valeurs par défaut',
    type: 'success',
    position: 'bottom-left'
  })
}

const exportPreferences = () => {
  const data = {
    visibleWidgets: visibleWidgets.value,
    widgetLayouts: widgetLayouts.value,
    advancedPreferences: {
      autoSave: autoSave.value,
      defaultGridColumns: parseInt(defaultGridColumns.value),
      editMode: isEditMode.value
    }
  }
  
  const dataStr = JSON.stringify(data, null, 2)
  const blob = new Blob([dataStr], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'dashboard_preferences.json'
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
  
  $toast.open({
    message: 'Préférences exportées avec succès',
    type: 'success',
    position: 'bottom-left'
  })
}



// Lifecycle
onMounted(async () => {
  await nextTick()
  await refreshData()
  
  // Charger les préférences avancées
  const savedPreferences = localStorage.getItem('dashboard-advanced-preferences')
  if (savedPreferences) {
    const preferences = JSON.parse(savedPreferences)
    autoSave.value = preferences.autoSave ?? true
    defaultGridColumns.value = preferences.defaultGridColumns?.toString() ?? '2'
    isEditMode.value = preferences.editMode ?? false
  }
  
  // Initialiser le mode édition si activé
  if (isEditMode.value) {
    initializeSortable()
  }
})

onUnmounted(() => {
  // Nettoyer les instances de graphiques
  if (salesChartInstance) salesChartInstance.destroy()
  if (topProductsChartInstance) topProductsChartInstance.destroy()
  if (orderStatusChartInstance) orderStatusChartInstance.destroy()
  if (stockEvolutionChartInstance) stockEvolutionChartInstance.destroy()

  // Détruire Sortable
  if (sortableInstance) {
    sortableInstance.destroy()
  }
})
</script>

<style scoped>
.dashboard-home {
  @apply min-h-screen bg-gray-50 p-6;
}

.dashboard-header {
  @apply mb-8;
}

.header-content {
  @apply flex items-center justify-between mb-2;
}

.dashboard-title {
  @apply text-3xl font-bold text-gray-900;
}

.dashboard-subtitle {
  @apply text-gray-600;
}

.header-actions {
  @apply flex gap-3;
}

.refresh-btn, .settings-btn, .edit-btn {
  @apply flex items-center gap-2 px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors;
}

.edit-btn.active {
  @apply bg-blue-500 text-white border-blue-500 hover:bg-blue-600;
}

.refresh-btn:disabled {
  @apply opacity-50 cursor-not-allowed;
}

.kpi-grid {
  @apply grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8;
}

.kpi-card {
  @apply bg-white rounded-lg shadow-sm p-6 flex items-center gap-4;
}

.kpi-icon {
  @apply p-3 rounded-lg text-white;
}

.kpi-content {
  @apply flex-1;
}

.kpi-title {
  @apply text-sm font-medium text-gray-600 mb-1;
}

.kpi-value {
  @apply text-2xl font-bold text-gray-900 mb-1;
}

.kpi-change {
  @apply text-sm flex items-center gap-1;
}

.kpi-change.positive {
  @apply text-green-600;
}

.kpi-change.negative {
  @apply text-red-600;
}

.kpi-change.neutral {
  @apply text-gray-600;
}

.kpi-period {
  @apply text-gray-500;
}

.widgets-container {
  @apply mb-8;
}

.widgets-grid {
  @apply grid grid-cols-1 lg:grid-cols-2 gap-6 relative;
}

.widgets-grid.edit-mode {
  @apply grid-cols-1;
}

.widget-card {
  @apply bg-white rounded-lg shadow-sm overflow-hidden relative;
}

.widget-card[style*="position: absolute"] {
  @apply absolute;
}

.widget-header {
  @apply flex items-center justify-between p-4 border-b border-gray-200;
}

.widget-drag-handle {
  @apply cursor-move p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.widget-title {
  @apply text-lg font-semibold text-gray-900;
}

.widget-actions {
  @apply flex items-center gap-2;
}

.period-select {
  @apply px-3 py-1 border border-gray-300 rounded text-sm;
}

.remove-widget-btn {
  @apply p-1 text-gray-400 hover:text-red-500 transition-colors;
}

.widget-content {
  @apply p-4;
}

.chart-canvas {
  @apply w-full h-64;
}

.modal-overlay {
  @apply fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50;
}

.modal-content {
  @apply bg-white rounded-lg shadow-xl max-w-md w-full mx-4;
}

.modal-header {
  @apply flex items-center justify-between p-6 border-b border-gray-200;
}

.modal-title {
  @apply text-xl font-semibold text-gray-900;
}

.modal-close {
  @apply p-1 text-gray-400 hover:text-gray-600 transition-colors;
}

.modal-body {
  @apply p-6;
}

.widget-settings {
  @apply space-y-4;
}

.settings-subtitle {
  @apply text-lg font-medium text-gray-900 mb-3;
}

.widget-options {
  @apply space-y-3;
}

.widget-option {
  @apply flex items-center gap-3 cursor-pointer;
}

.widget-option input[type="checkbox"] {
  @apply w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500;
}

.widget-option-label {
  @apply text-gray-700;
}

.advanced-settings {
  @apply space-y-4;
}

.setting-group {
  @apply space-y-2;
}

.setting-label {
  @apply text-sm font-medium text-gray-700;
}

.setting-description {
  @apply text-xs text-gray-500;
}

.setting-btn {
  @apply px-3 py-1 bg-blue-500 text-white rounded-md text-sm hover:bg-blue-600 transition-colors;
}

.setting-btn.active {
  @apply bg-blue-600;
}

.toggle-switch {
  @apply relative inline-block w-10 h-6 rounded-full bg-gray-300 cursor-pointer;
}

.toggle-switch input {
  opacity: 0;
  width: 0;
  height: 0;
}

.toggle-slider {
  @apply absolute inset-0 rounded-full bg-white transition-transform duration-300;
}

.toggle-slider:before {
  @apply absolute left-1 top-1 bg-blue-600 rounded-full h-4 w-4 transition-transform duration-300;
}

.toggle-switch input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-switch input:checked + .toggle-slider:before {
  @apply translate-x-full;
}

.grid-select {
  @apply px-3 py-1 border border-gray-300 rounded text-sm;
}

.settings-actions {
  @apply flex justify-end gap-3;
}

.reset-btn, .export-btn {
  @apply px-4 py-2 bg-green-500 text-white rounded-md text-sm hover:bg-green-600 transition-colors;
}

/* Styles pour le drag & drop */
.sortable-ghost {
  opacity: 0.5;
  background: #f0f9ff;
  border: 2px dashed #3b82f6;
}

.sortable-chosen {
  opacity: 0.8;
  transform: rotate(2deg);
}

/* Poignées de redimensionnement */
.resize-handles {
  @apply absolute inset-0 pointer-events-none;
}

.resize-handle {
  @apply absolute w-3 h-3 bg-blue-500 border-2 border-white rounded-full pointer-events-auto cursor-nwse-resize opacity-0 transition-opacity;
}

.widget-card:hover .resize-handle {
  @apply opacity-100;
}

.resize-handle-nw {
  @apply top-1 left-1 cursor-nw-resize;
}

.resize-handle-ne {
  @apply top-1 right-1 cursor-ne-resize;
}

.resize-handle-sw {
  @apply bottom-1 left-1 cursor-sw-resize;
}

.resize-handle-se {
  @apply bottom-1 right-1 cursor-se-resize;
}

/* Toggle switch amélioré */
.toggle-switch {
  @apply relative inline-block w-12 h-6 rounded-full bg-gray-300 cursor-pointer transition-colors;
}

.toggle-switch input {
  @apply opacity-0 w-0 h-0;
}

.toggle-slider {
  @apply absolute inset-0 rounded-full transition-all duration-300;
}

.toggle-slider:before {
  @apply absolute left-0.5 top-0.5 bg-white rounded-full h-5 w-5 transition-transform duration-300;
}

.toggle-switch input:checked + .toggle-slider {
  @apply bg-blue-600;
}

.toggle-switch input:checked + .toggle-slider:before {
  @apply translate-x-6;
}

/* Grille responsive */
@media (min-width: 1024px) {
  .widgets-grid {
    grid-template-columns: repeat(var(--grid-cols, 2), 1fr);
  }
}

.loading-overlay {
  @apply fixed inset-0 bg-white bg-opacity-75 flex items-center justify-center z-50;
}

.loading-spinner {
  @apply flex flex-col items-center gap-3;
}

.loading-text {
  @apply text-gray-600;
}


</style> 