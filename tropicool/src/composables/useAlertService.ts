import { ref, computed } from 'vue'
import { alertService, type Alert, type AlertFilters, type AlertPreference } from '../services/alertService'
import { useToast } from 'vue-toast-notification'

export interface UseAlertServiceOptions {
  autoLoad?: boolean
  showToast?: boolean
  retryAttempts?: number
}

export function useAlertService(options: UseAlertServiceOptions = {}) {
  const {
    autoLoad = false,
    showToast = true,
    retryAttempts = 3
  } = options

  const $toast = useToast()

  // États réactifs
  const isLoading = ref(false)
  const isError = ref(false)
  const error = ref<string | null>(null)
  const alerts = ref<Alert[]>([])
  const preferences = ref<AlertPreference[]>([])
  const unreadCount = ref(0)
  const totalCount = ref(0)

  // Computed
  const hasAlerts = computed(() => alerts.value.length > 0)
  const hasUnreadAlerts = computed(() => unreadCount.value > 0)
  const isEmpty = computed(() => !isLoading.value && !isError.value && alerts.value.length === 0)

  // Méthodes utilitaires
  const showSuccessToast = (message: string) => {
    if (showToast) {
      $toast.open({
        message,
        type: 'success',
        position: 'bottom-left',
        duration: 3000
      })
    }
  }

  const showErrorToast = (message: string) => {
    if (showToast) {
      $toast.open({
        message,
        type: 'error',
        position: 'bottom-left',
        duration: 5000
      })
    }
  }

  const setLoading = (loading: boolean) => {
    isLoading.value = loading
    if (loading) {
      isError.value = false
      error.value = null
    }
  }

  const setError = (err: string) => {
    isError.value = true
    error.value = err
    isLoading.value = false
    showErrorToast(err)
  }

  const clearError = () => {
    isError.value = false
    error.value = null
  }

  // Méthodes avec retry automatique
  const withRetry = async <T>(
    operation: () => Promise<T>,
    context: string
  ): Promise<T> => {
    let lastError: Error | null = null

    for (let attempt = 1; attempt <= retryAttempts; attempt++) {
      try {
        return await operation()
      } catch (err) {
        lastError = err as Error
        console.warn(`${context} attempt ${attempt} failed:`, err)

        if (attempt < retryAttempts) {
          // Attendre avant de réessayer (backoff exponentiel)
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
        }
      }
    }

    throw lastError || new Error(`${context} failed after ${retryAttempts} attempts`)
  }

  // ===== CRUD Operations =====

  /**
   * Charger les alertes d'un utilisateur
   */
  const loadAlerts = async (filters?: AlertFilters) => {
    try {
      setLoading(true)
      clearError()

      const response = await withRetry(
        () => alertService.getUserAlerts(filters),
        'Chargement des alertes'
      )

      alerts.value = response.data
      totalCount.value = response.pagination.total
      
      // Calculer le nombre d'alertes non lues
      unreadCount.value = alerts.value.filter(alert => !alert.is_read).length

      return response
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des alertes'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Charger les préférences d'alertes
   */
  const loadPreferences = async () => {
    try {
      setLoading(true)
      clearError()

      const prefs = await withRetry(
        () => alertService.getUserPreferences(),
        'Chargement des préférences'
      )

      preferences.value = prefs
      return prefs
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des préférences'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Sauvegarder les préférences d'alertes
   */
  const savePreferences = async (prefs: AlertPreference[]) => {
    try {
      setLoading(true)
      clearError()

      const result = await withRetry(
        () => alertService.saveUserPreferences(prefs),
        'Sauvegarde des préférences'
      )

      preferences.value = prefs
      showSuccessToast('Préférences sauvegardées avec succès')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la sauvegarde des préférences'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Marquer une alerte comme lue
   */
  const markAsRead = async (alertId: string) => {
    try {
      const updatedAlert = await withRetry(
        () => alertService.markAsRead(alertId),
        'Marquage comme lu'
      )

      // Mettre à jour l'alerte dans la liste locale
      const index = alerts.value.findIndex(alert => alert.id === alertId)
      if (index !== -1) {
        alerts.value[index] = updatedAlert
        unreadCount.value = Math.max(0, unreadCount.value - 1)
      }

      showSuccessToast('Alerte marquée comme lue')
      return updatedAlert
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage comme lu'
      setError(errorMessage)
      throw err
    }
  }

  /**
   * Marquer toutes les alertes comme lues
   */
  const markAllAsRead = async () => {
    try {
      setLoading(true)
      clearError()

      const result = await withRetry(
        () => alertService.markAllAsRead(),
        'Marquage de toutes les alertes comme lues'
      )

      // Mettre à jour toutes les alertes locales
      alerts.value = alerts.value.map(alert => ({ ...alert, is_read: true }))
      unreadCount.value = 0

      showSuccessToast('Toutes les alertes ont été marquées comme lues')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du marquage de toutes les alertes'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Supprimer une alerte
   */
  const deleteAlert = async (alertId: string) => {
    try {
      const result = await withRetry(
        () => alertService.deleteAlert(alertId),
        'Suppression de l\'alerte'
      )

      // Retirer l'alerte de la liste locale
      const index = alerts.value.findIndex(alert => alert.id === alertId)
      if (index !== -1) {
        const deletedAlert = alerts.value[index]
        alerts.value.splice(index, 1)
        totalCount.value = Math.max(0, totalCount.value - 1)
        
        // Mettre à jour le compteur d'alertes non lues
        if (!deletedAlert.is_read) {
          unreadCount.value = Math.max(0, unreadCount.value - 1)
        }
      }

      showSuccessToast('Alerte supprimée avec succès')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de l\'alerte'
      setError(errorMessage)
      throw err
    }
  }

  /**
   * Supprimer toutes les alertes
   */
  const deleteAllAlerts = async () => {
    try {
      setLoading(true)
      clearError()

      const result = await withRetry(
        () => alertService.deleteAllUserAlerts(),
        'Suppression de toutes les alertes'
      )

      // Vider la liste locale
      alerts.value = []
      totalCount.value = 0
      unreadCount.value = 0

      showSuccessToast('Toutes les alertes ont été supprimées')
      return result
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la suppression de toutes les alertes'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  // ===== Statistiques =====

  /**
   * Charger les statistiques des alertes
   */
  const loadStats = async () => {
    try {
      const stats = await withRetry(
        () => alertService.getAlertStats(),
        'Chargement des statistiques'
      )

      unreadCount.value = stats.unread
      totalCount.value = stats.total

      return stats
    } catch (err) {
      console.error('Erreur lors du chargement des statistiques:', err)
      // Ne pas afficher d'erreur toast pour les stats
      return null
    }
  }

  /**
   * Vérifier s'il y a des alertes non lues
   */
  const checkUnreadAlerts = async () => {
    try {
      const hasUnread = await alertService.hasUnreadAlerts()
      unreadCount.value = hasUnread ? 1 : 0 // Valeur approximative
      return hasUnread
    } catch (err) {
      console.error('Erreur lors de la vérification des alertes non lues:', err)
      return false
    }
  }

  // ===== Recherche et Filtrage =====

  /**
   * Rechercher dans les alertes
   */
  const searchAlerts = async (query: string, filters?: Omit<AlertFilters, 'search'>) => {
    try {
      setLoading(true)
      clearError()

      const results = await withRetry(
        () => alertService.searchAlerts(query, filters),
        'Recherche dans les alertes'
      )

      alerts.value = results
      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la recherche'
      setError(errorMessage)
      throw err
    } finally {
      setLoading(false)
    }
  }

  /**
   * Récupérer les alertes récentes
   */
  const loadRecentAlerts = async (limit: number = 5) => {
    try {
      const recent = await withRetry(
        () => alertService.getRecentAlerts(limit),
        'Chargement des alertes récentes'
      )

      return recent
    } catch (err) {
      console.error('Erreur lors du chargement des alertes récentes:', err)
      return []
    }
  }

  // ===== Cache Management =====

  /**
   * Vider le cache du service
   */
  const clearCache = () => {
    alertService.clearCache()
  }

  /**
   * Recharger les données
   */
  const refresh = async () => {
    clearCache()
    clearError()
    await loadAlerts()
    await loadStats()
  }

  // ===== Initialisation =====

  const initialize = async () => {
    if (autoLoad) {
      await Promise.all([
        loadAlerts(),
        loadPreferences(),
        loadStats()
      ])
    }
  }

  // Retourner l'interface publique
  return {
    // États
    isLoading: computed(() => isLoading.value),
    isError: computed(() => isError.value),
    error: computed(() => error.value),
    alerts: computed(() => alerts.value),
    preferences: computed(() => preferences.value),
    unreadCount: computed(() => unreadCount.value),
    totalCount: computed(() => totalCount.value),

    // Computed
    hasAlerts,
    hasUnreadAlerts,
    isEmpty,

    // Méthodes
    loadAlerts,
    loadPreferences,
    savePreferences,
    markAsRead,
    markAllAsRead,
    deleteAlert,
    deleteAllAlerts,
    loadStats,
    checkUnreadAlerts,
    searchAlerts,
    loadRecentAlerts,
    clearCache,
    refresh,
    initialize,
    clearError,

    // Utilitaires
    setLoading,
    setError
  }
} 