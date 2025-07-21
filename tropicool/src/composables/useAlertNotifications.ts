import { ref, onMounted, onUnmounted } from 'vue'
import { useToast } from 'vue-toast-notification'
import { alertService } from '../services/alertService'
import { useAuthStore } from '../stores/authStore'

export interface AlertNotification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'promotion' | 'restock' | 'new-product'
  title: string
  message: string
  actions?: Array<{
    id: string
    label: string
    type: 'primary' | 'secondary' | 'danger' | 'success'
    handler?: () => void | Promise<void>
  }>
  autoDismiss?: boolean
  autoDismissDelay?: number
}

export interface UseAlertNotificationsOptions {
  enableRealTime?: boolean
  checkInterval?: number
  maxNotifications?: number
  showToast?: boolean
  position?: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left'
}

export function useAlertNotifications(options: UseAlertNotificationsOptions = {}) {
  const {
    enableRealTime = true,
    checkInterval = 30000, // 30 secondes
    maxNotifications = 5,
    showToast = true,
    position = 'bottom-left' as const
  } = options

  const $toast = useToast()
  const authStore = useAuthStore()

  // États réactifs
  const notifications = ref<AlertNotification[]>([])
  const isChecking = ref(false)
  const lastCheckTime = ref<Date | null>(null)
  const checkIntervalId = ref<number | null>(null)

  // ===== Gestion des Notifications =====

  /**
   * Ajouter une notification
   */
  const addNotification = (notification: AlertNotification) => {
    // Limiter le nombre de notifications
    if (notifications.value.length >= maxNotifications) {
      notifications.value.shift() // Retirer la plus ancienne
    }

    notifications.value.push(notification)

    // Afficher le toast si activé
    if (showToast) {
      showNotificationToast(notification)
    }
  }

  /**
   * Supprimer une notification
   */
  const removeNotification = (notificationId: string) => {
    const index = notifications.value.findIndex(n => n.id === notificationId)
    if (index !== -1) {
      notifications.value.splice(index, 1)
    }
  }

  /**
   * Vider toutes les notifications
   */
  const clearNotifications = () => {
    notifications.value = []
  }

  /**
   * Afficher une notification toast
   */
  const showNotificationToast = (notification: AlertNotification) => {
    const toastOptions = {
      message: notification.message,
      type: notification.type,
      position,
      duration: notification.autoDismiss ? (notification.autoDismissDelay || 5000) : 0,
      dismissible: !notification.autoDismiss
    }

    $toast.open(toastOptions)
  }

  // ===== Notifications Prédéfinies =====

  /**
   * Notification de nouveau produit
   */
  const showNewProductNotification = (productName: string, productId?: string) => {
    const notification: AlertNotification = {
      id: `new-product-${Date.now()}`,
      type: 'new-product',
      title: 'Nouveau Produit',
      message: `Un nouveau produit "${productName}" est disponible !`,
      actions: [
        {
          id: 'view',
          label: 'Voir le produit',
          type: 'primary',
          handler: () => {
            if (productId) {
              // Navigation vers le produit
              console.log('Navigation vers le produit:', productId)
            }
          }
        }
      ],
      autoDismiss: true,
      autoDismissDelay: 8000
    }

    addNotification(notification)
  }

  /**
   * Notification de réapprovisionnement
   */
  const showRestockNotification = (productName: string, productId?: string) => {
    const notification: AlertNotification = {
      id: `restock-${Date.now()}`,
      type: 'restock',
      title: 'Produit Réapprovisionné',
      message: `Le produit "${productName}" est de nouveau en stock !`,
      actions: [
        {
          id: 'add-to-cart',
          label: 'Ajouter au panier',
          type: 'success',
          handler: () => {
            if (productId) {
              // Ajouter au panier
              console.log('Ajouter au panier:', productId)
            }
          }
        },
        {
          id: 'view',
          label: 'Voir le produit',
          type: 'secondary',
          handler: () => {
            if (productId) {
              // Navigation vers le produit
              console.log('Navigation vers le produit:', productId)
            }
          }
        }
      ],
      autoDismiss: true,
      autoDismissDelay: 10000
    }

    addNotification(notification)
  }

  /**
   * Notification de promotion
   */
  const showPromotionNotification = (promotionTitle: string, discount?: string) => {
    const notification: AlertNotification = {
      id: `promotion-${Date.now()}`,
      type: 'promotion',
      title: 'Nouvelle Promotion',
      message: `${promotionTitle}${discount ? ` - ${discount} de réduction !` : ' !'}`,
      actions: [
        {
          id: 'view',
          label: 'Voir les offres',
          type: 'primary',
          handler: () => {
            // Navigation vers les promotions
            console.log('Navigation vers les promotions')
          }
        }
      ],
      autoDismiss: true,
      autoDismissDelay: 12000
    }

    addNotification(notification)
  }

  /**
   * Notification de changement de prix
   */
  const showPriceChangeNotification = (productName: string, oldPrice: number, newPrice: number) => {
    const isDecrease = newPrice < oldPrice
    const notification: AlertNotification = {
      id: `price-change-${Date.now()}`,
      type: isDecrease ? 'success' : 'warning',
      title: isDecrease ? 'Prix Réduit' : 'Prix Augmenté',
      message: `Le prix de "${productName}" a ${isDecrease ? 'diminué' : 'augmenté'} de ${Math.abs(oldPrice - newPrice).toFixed(2)}€`,
      actions: [
        {
          id: 'view',
          label: 'Voir le produit',
          type: 'primary',
          handler: () => {
            // Navigation vers le produit
            console.log('Navigation vers le produit')
          }
        }
      ],
      autoDismiss: true,
      autoDismissDelay: 8000
    }

    addNotification(notification)
  }

  /**
   * Notification de newsletter
   */
  const showNewsletterNotification = (title: string, message: string) => {
    const notification: AlertNotification = {
      id: `newsletter-${Date.now()}`,
      type: 'info',
      title,
      message,
      actions: [
        {
          id: 'read',
          label: 'Lire plus',
          type: 'primary',
          handler: () => {
            // Ouvrir la newsletter
            console.log('Ouvrir la newsletter')
          }
        }
      ],
      autoDismiss: true,
      autoDismissDelay: 15000
    }

    addNotification(notification)
  }

  /**
   * Notification d'erreur
   */
  const showErrorNotification = (title: string, message: string) => {
    const notification: AlertNotification = {
      id: `error-${Date.now()}`,
      type: 'error',
      title,
      message,
      autoDismiss: false
    }

    addNotification(notification)
  }

  /**
   * Notification de succès
   */
  const showSuccessNotification = (title: string, message: string) => {
    const notification: AlertNotification = {
      id: `success-${Date.now()}`,
      type: 'success',
      title,
      message,
      autoDismiss: true,
      autoDismissDelay: 5000
    }

    addNotification(notification)
  }

  // ===== Vérification en Temps Réel =====

  /**
   * Vérifier les nouvelles alertes
   */
  const checkNewAlerts = async () => {
    if (!authStore.isLoggedIn || isChecking.value) {
      return
    }

    try {
      isChecking.value = true

      // Récupérer les alertes récentes
      const recentAlerts = await alertService.getRecentAlerts(10)
      
      // Filtrer les alertes plus récentes que la dernière vérification
      const newAlerts = recentAlerts.filter(alert => {
        if (!lastCheckTime.value) return true
        return new Date(alert.created_at) > lastCheckTime.value!
      })

      // Créer des notifications pour les nouvelles alertes
      newAlerts.forEach(alert => {
        createNotificationFromAlert(alert)
      })

      lastCheckTime.value = new Date()
    } catch (error) {
      console.error('Erreur lors de la vérification des alertes:', error)
    } finally {
      isChecking.value = false
    }
  }

  /**
   * Créer une notification à partir d'une alerte
   */
  const createNotificationFromAlert = (alert: any) => {
    const notification: AlertNotification = {
      id: alert.id,
      type: getAlertType(alert.alert_type_id),
      title: alert.title || getDefaultTitle(alert.alert_type_id),
      message: alert.message || getDefaultMessage(alert.alert_type_id),
      autoDismiss: true,
      autoDismissDelay: 8000
    }

    addNotification(notification)
  }

  /**
   * Obtenir le type de notification à partir du type d'alerte
   */
  const getAlertType = (alertTypeId: string): AlertNotification['type'] => {
    const typeMap: Record<string, AlertNotification['type']> = {
      newsletter: 'info',
      new_products: 'new-product',
      promotions: 'promotion',
      restock: 'restock',
      price_change: 'warning'
    }

    return typeMap[alertTypeId] || 'info'
  }

  /**
   * Obtenir le titre par défaut
   */
  const getDefaultTitle = (alertTypeId: string): string => {
    const titleMap: Record<string, string> = {
      newsletter: 'Newsletter',
      new_products: 'Nouveau Produit',
      promotions: 'Nouvelle Promotion',
      restock: 'Produit Réapprovisionné',
      price_change: 'Changement de Prix'
    }

    return titleMap[alertTypeId] || 'Nouvelle Alerte'
  }

  /**
   * Obtenir le message par défaut
   */
  const getDefaultMessage = (alertTypeId: string): string => {
    const messageMap: Record<string, string> = {
      newsletter: 'Vous avez reçu une nouvelle newsletter',
      new_products: 'Un nouveau produit est disponible',
      promotions: 'Une nouvelle promotion est disponible',
      restock: 'Un produit est de nouveau en stock',
      price_change: 'Le prix d\'un produit a changé'
    }

    return messageMap[alertTypeId] || 'Vous avez une nouvelle notification'
  }

  // ===== Gestion du Cycle de Vie =====

  /**
   * Démarrer la vérification en temps réel
   */
  const startRealTimeChecking = () => {
    if (!enableRealTime || checkIntervalId.value) {
      return
    }

    // Vérification initiale
    checkNewAlerts()

    // Configurer l'intervalle
    checkIntervalId.value = setInterval(checkNewAlerts, checkInterval)
  }

  /**
   * Arrêter la vérification en temps réel
   */
  const stopRealTimeChecking = () => {
    if (checkIntervalId.value) {
      clearInterval(checkIntervalId.value)
      checkIntervalId.value = null
    }
  }

  // ===== Initialisation et Nettoyage =====

  onMounted(() => {
    if (enableRealTime && authStore.isLoggedIn) {
      startRealTimeChecking()
    }
  })

  onUnmounted(() => {
    stopRealTimeChecking()
  })

  // ===== Interface Publique =====

  return {
    // États
    notifications: notifications.value,
    isChecking: isChecking.value,
    lastCheckTime: lastCheckTime.value,

    // Méthodes de gestion
    addNotification,
    removeNotification,
    clearNotifications,
    showNotificationToast,

    // Notifications prédéfinies
    showNewProductNotification,
    showRestockNotification,
    showPromotionNotification,
    showPriceChangeNotification,
    showNewsletterNotification,
    showErrorNotification,
    showSuccessNotification,

    // Vérification en temps réel
    checkNewAlerts,
    startRealTimeChecking,
    stopRealTimeChecking,

    // Utilitaires
    createNotificationFromAlert,
    getAlertType,
    getDefaultTitle,
    getDefaultMessage
  }
} 