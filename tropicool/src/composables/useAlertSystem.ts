import { computed } from 'vue'
import { useAlertService } from './useAlertService'
import { useAlertNotifications } from './useAlertNotifications'
import { useAuthStore } from '../stores/authStore'

export interface UseAlertSystemOptions {
  autoLoad?: boolean
  enableRealTime?: boolean
  showToast?: boolean
  retryAttempts?: number
  checkInterval?: number
  maxNotifications?: number
}

/**
 * Composable principal pour gérer tout le système d'alertes
 * Combine useAlertService et useAlertNotifications
 */
export function useAlertSystem(options: UseAlertSystemOptions = {}) {
  const {
    autoLoad = true,
    enableRealTime = true,
    showToast = true,
    retryAttempts = 3,
    checkInterval = 30000,
    maxNotifications = 5
  } = options

  const authStore = useAuthStore()

  // Services d'alertes
  const alertService = useAlertService({
    autoLoad: false, // On gère le chargement manuellement
    showToast,
    retryAttempts
  })

  const alertNotifications = useAlertNotifications({
    enableRealTime,
    checkInterval,
    maxNotifications,
    showToast
  })

  // Computed combinés
  const hasAnyAlerts = computed(() => 
    alertService.hasAlerts.value || alertService.hasUnreadAlerts.value
  )

  const totalNotifications = computed(() => 
    alertService.totalCount.value + alertNotifications.notifications.length
  )

  const isSystemBusy = computed(() => 
    alertService.isLoading.value || alertNotifications.isChecking
  )

  // ===== Méthodes Combinées =====

  /**
   * Initialiser le système d'alertes complet
   */
  const initializeSystem = async () => {
    if (!authStore.isLoggedIn) {
      return
    }

    try {
      // Charger les données de base
      await Promise.all([
        alertService.loadAlerts(),
        alertService.loadPreferences(),
        alertService.loadStats()
      ])

      // Démarrer la vérification en temps réel
      if (enableRealTime) {
        alertNotifications.startRealTimeChecking()
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation du système d\'alertes:', error)
    }
  }

  /**
   * Recharger tout le système
   */
  const refreshSystem = async () => {
    await Promise.all([
      alertService.refresh(),
      alertNotifications.checkNewAlerts()
    ])
  }

  /**
   * Nettoyer tout le système
   */
  const clearSystem = () => {
    alertService.clearCache()
    alertNotifications.clearNotifications()
  }

  // ===== Notifications Rapides =====

  /**
   * Notification rapide de nouveau produit
   */
  const notifyNewProduct = (productName: string, productId?: string) => {
    alertNotifications.showNewProductNotification(productName, productId)
  }

  /**
   * Notification rapide de réapprovisionnement
   */
  const notifyRestock = (productName: string, productId?: string) => {
    alertNotifications.showRestockNotification(productName, productId)
  }

  /**
   * Notification rapide de promotion
   */
  const notifyPromotion = (promotionTitle: string, discount?: string) => {
    alertNotifications.showPromotionNotification(promotionTitle, discount)
  }

  /**
   * Notification rapide de changement de prix
   */
  const notifyPriceChange = (productName: string, oldPrice: number, newPrice: number) => {
    alertNotifications.showPriceChangeNotification(productName, oldPrice, newPrice)
  }

  /**
   * Notification rapide de newsletter
   */
  const notifyNewsletter = (title: string, message: string) => {
    alertNotifications.showNewsletterNotification(title, message)
  }

  /**
   * Notification rapide d'erreur
   */
  const notifyError = (title: string, message: string) => {
    alertNotifications.showErrorNotification(title, message)
  }

  /**
   * Notification rapide de succès
   */
  const notifySuccess = (title: string, message: string) => {
    alertNotifications.showSuccessNotification(title, message)
  }

  // ===== Actions Combinées =====

  /**
   * Marquer toutes les alertes comme lues et vider les notifications
   */
  const markAllAsReadAndClear = async () => {
    await Promise.all([
      alertService.markAllAsRead(),
      alertNotifications.clearNotifications()
    ])
  }

  /**
   * Supprimer toutes les alertes et notifications
   */
  const deleteAllAndClear = async () => {
    await Promise.all([
      alertService.deleteAllAlerts(),
      alertNotifications.clearNotifications()
    ])
  }

  // ===== Getters Combinés =====

  /**
   * Obtenir toutes les alertes et notifications
   */
  const getAllAlerts = computed(() => [
    ...alertService.alerts.value,
    ...alertNotifications.notifications.map(notification => ({
      id: notification.id,
      type: notification.type,
      title: notification.title,
      message: notification.message,
      is_read: false,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: authStore.userId,
      alert_type_id: 'notification',
      is_active: true
    }))
  ])

  /**
   * Obtenir les alertes non lues uniquement
   */
  const getUnreadAlerts = computed(() => 
    getAllAlerts.value.filter(alert => !alert.is_read)
  )

  /**
   * Obtenir le nombre total d'alertes non lues
   */
  const getTotalUnreadCount = computed(() => 
    alertService.unreadCount.value + alertNotifications.notifications.length
  )

  // ===== Utilitaires =====

  /**
   * Vérifier si l'utilisateur a des alertes actives
   */
  const hasActiveAlerts = computed(() => 
    alertService.hasUnreadAlerts.value || 
    alertNotifications.notifications.length > 0
  )

  /**
   * Obtenir un résumé des alertes
   */
  const getAlertSummary = computed(() => ({
    total: alertService.totalCount.value,
    unread: alertService.unreadCount.value,
    notifications: alertNotifications.notifications.length,
    totalUnread: getTotalUnreadCount.value,
    hasActive: hasActiveAlerts.value,
    lastCheck: alertNotifications.lastCheckTime
  }))

  // ===== Interface Publique =====

  return {
    // États combinés
    isLoading: alertService.isLoading,
    isError: alertService.isError,
    error: alertService.error,
    isChecking: computed(() => alertNotifications.isChecking),
    isSystemBusy,

    // Données
    alerts: alertService.alerts,
    preferences: alertService.preferences,
    notifications: computed(() => alertNotifications.notifications),
    unreadCount: alertService.unreadCount,
    totalCount: alertService.totalCount,

    // Computed combinés
    hasAlerts: alertService.hasAlerts,
    hasUnreadAlerts: alertService.hasUnreadAlerts,
    hasAnyAlerts,
    isEmpty: alertService.isEmpty,
    totalNotifications,
    hasActiveAlerts,

    // Getters combinés
    getAllAlerts,
    getUnreadAlerts,
    getTotalUnreadCount,
    getAlertSummary,

    // Méthodes du service
    loadAlerts: alertService.loadAlerts,
    loadPreferences: alertService.loadPreferences,
    savePreferences: alertService.savePreferences,
    markAsRead: alertService.markAsRead,
    markAllAsRead: alertService.markAllAsRead,
    deleteAlert: alertService.deleteAlert,
    deleteAllAlerts: alertService.deleteAllAlerts,
    loadStats: alertService.loadStats,
    checkUnreadAlerts: alertService.checkUnreadAlerts,
    searchAlerts: alertService.searchAlerts,
    loadRecentAlerts: alertService.loadRecentAlerts,

    // Méthodes des notifications
    addNotification: alertNotifications.addNotification,
    removeNotification: alertNotifications.removeNotification,
    clearNotifications: alertNotifications.clearNotifications,
    checkNewAlerts: alertNotifications.checkNewAlerts,
    startRealTimeChecking: alertNotifications.startRealTimeChecking,
    stopRealTimeChecking: alertNotifications.stopRealTimeChecking,

    // Notifications rapides
    notifyNewProduct,
    notifyRestock,
    notifyPromotion,
    notifyPriceChange,
    notifyNewsletter,
    notifyError,
    notifySuccess,

    // Méthodes combinées
    initializeSystem,
    refreshSystem,
    clearSystem,
    markAllAsReadAndClear,
    deleteAllAndClear,

    // Utilitaires
    clearError: alertService.clearError,
    clearCache: alertService.clearCache
  }
} 