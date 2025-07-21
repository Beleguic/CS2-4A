import { useAuthStore } from '../stores/authStore'

// Types
export interface Alert {
  id: string
  user_id: string
  alert_type_id: string
  category_id?: string
  product_id?: string
  is_active: boolean
  is_read: boolean
  title?: string
  message?: string
  created_at: string
  updated_at: string
}

export interface AlertType {
  id: string
  name: string
  description?: string
  icon?: string
  is_active: boolean
}

export interface AlertPreference {
  user_id: string
  alert_type_id: string
  category_id?: string
  product_id?: string
  is_active: boolean
}

export interface CreateAlertData {
  user_id: string
  alert_type_id: string
  category_id?: string
  product_id?: string
  title?: string
  message?: string
}

export interface UpdateAlertData {
  is_active?: boolean
  is_read?: boolean
  title?: string
  message?: string
}

export interface AlertFilters {
  type?: string
  status?: 'read' | 'unread' | 'all'
  period?: 'today' | 'week' | 'month' | 'all'
  category_id?: string
  product_id?: string
  search?: string
  page?: number
  limit?: number
}

export interface AlertResponse {
  success: boolean
  data?: any
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

class AlertService {
  private baseURL: string
  private authStore: any

  constructor() {
    this.baseURL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
    this.authStore = useAuthStore()
  }

  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json'
    }

    const token = localStorage.getItem('token')
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }

    return headers
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || `HTTP error! status: ${response.status}`)
    }

    return response.json()
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}/alert${endpoint}`
    
    const config: RequestInit = {
      headers: this.getHeaders(),
      ...options
    }

    try {
      const response = await fetch(url, config)
      return await this.handleResponse<T>(response)
    } catch (error) {
      console.error(`AlertService error for ${endpoint}:`, error)
      throw error
    }
  }

  // ===== CRUD Operations =====

  /**
   * Récupérer toutes les alertes d'un utilisateur
   */
  async getUserAlerts(filters?: AlertFilters): Promise<PaginatedResponse<Alert>> {
    const params = new URLSearchParams()
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          params.append(key, value.toString())
        }
      })
    }

    const queryString = params.toString()
    const endpoint = queryString ? `/user/${this.authStore.userId}?${queryString}` : `/user/${this.authStore.userId}`
    
    return this.makeRequest<PaginatedResponse<Alert>>(endpoint)
  }

  /**
   * Récupérer une alerte par ID
   */
  async getAlertById(alertId: string): Promise<Alert> {
    return this.makeRequest<Alert>(`/${alertId}`)
  }

  /**
   * Créer une nouvelle alerte
   */
  async createAlert(alertData: CreateAlertData): Promise<Alert> {
    return this.makeRequest<Alert>('', {
      method: 'POST',
      body: JSON.stringify(alertData)
    })
  }

  /**
   * Créer plusieurs alertes en lot
   */
  async createBulkAlerts(alerts: CreateAlertData[]): Promise<Alert[]> {
    return this.makeRequest<Alert[]>('/bulk', {
      method: 'POST',
      body: JSON.stringify({ alerts })
    })
  }

  /**
   * Mettre à jour une alerte
   */
  async updateAlert(alertId: string, updateData: UpdateAlertData): Promise<Alert> {
    return this.makeRequest<Alert>(`/${alertId}`, {
      method: 'PUT',
      body: JSON.stringify(updateData)
    })
  }

  /**
   * Supprimer une alerte
   */
  async deleteAlert(alertId: string): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/${alertId}`, {
      method: 'DELETE'
    })
  }

  /**
   * Marquer une alerte comme lue
   */
  async markAsRead(alertId: string): Promise<Alert> {
    return this.updateAlert(alertId, { is_read: true })
  }

  /**
   * Marquer toutes les alertes comme lues
   */
  async markAllAsRead(): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/user/${this.authStore.userId}/mark-all-read`, {
      method: 'PUT'
    })
  }

  /**
   * Supprimer toutes les alertes d'un utilisateur
   */
  async deleteAllUserAlerts(): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/user/${this.authStore.userId}`, {
      method: 'DELETE'
    })
  }

  // ===== Alert Types =====

  /**
   * Récupérer tous les types d'alertes
   */
  async getAlertTypes(): Promise<AlertType[]> {
    return this.makeRequest<AlertType[]>('/types')
  }

  /**
   * Récupérer un type d'alerte par ID
   */
  async getAlertTypeById(typeId: string): Promise<AlertType> {
    return this.makeRequest<AlertType>(`/types/${typeId}`)
  }

  // ===== User Preferences =====

  /**
   * Récupérer les préférences d'alertes d'un utilisateur
   */
  async getUserPreferences(): Promise<AlertPreference[]> {
    return this.makeRequest<AlertPreference[]>(`/preferences/${this.authStore.userId}`)
  }

  /**
   * Sauvegarder les préférences d'alertes
   */
  async saveUserPreferences(preferences: AlertPreference[]): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/preferences/${this.authStore.userId}`, {
      method: 'POST',
      body: JSON.stringify({ preferences })
    })
  }

  /**
   * Mettre à jour une préférence spécifique
   */
  async updateUserPreference(preference: AlertPreference): Promise<AlertPreference> {
    return this.makeRequest<AlertPreference>(`/preferences/${this.authStore.userId}`, {
      method: 'PUT',
      body: JSON.stringify(preference)
    })
  }

  // ===== Statistics =====

  /**
   * Récupérer les statistiques des alertes
   */
  async getAlertStats(): Promise<{
    total: number
    unread: number
    read: number
    byType: Record<string, number>
    recentActivity: Array<{
      date: string
      count: number
    }>
  }> {
    return this.makeRequest(`/stats/${this.authStore.userId}`)
  }

  /**
   * Récupérer le nombre d'alertes non lues
   */
  async getUnreadCount(): Promise<number> {
    const stats = await this.getAlertStats()
    return stats.unread
  }

  // ===== Notifications =====

  /**
   * Envoyer une notification push (si supporté)
   */
  async sendPushNotification(alertId: string): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/${alertId}/push`, {
      method: 'POST'
    })
  }

  /**
   * Marquer une notification comme envoyée
   */
  async markNotificationSent(alertId: string): Promise<AlertResponse> {
    return this.makeRequest<AlertResponse>(`/${alertId}/sent`, {
      method: 'PUT'
    })
  }

  // ===== Utility Methods =====

  /**
   * Vérifier si l'utilisateur a des alertes non lues
   */
  async hasUnreadAlerts(): Promise<boolean> {
    try {
      const unreadCount = await this.getUnreadCount()
      return unreadCount > 0
    } catch (error) {
      console.error('Error checking unread alerts:', error)
      return false
    }
  }

  /**
   * Récupérer les alertes récentes (dernières 24h)
   */
  async getRecentAlerts(limit: number = 5): Promise<Alert[]> {
    const filters: AlertFilters = {
      period: 'today',
      limit
    }
    
    const response = await this.getUserAlerts(filters)
    return response.data
  }

  /**
   * Rechercher dans les alertes
   */
  async searchAlerts(query: string, filters?: Omit<AlertFilters, 'search'>): Promise<Alert[]> {
    const searchFilters: AlertFilters = {
      ...filters,
      search: query
    }
    
    const response = await this.getUserAlerts(searchFilters)
    return response.data
  }

  // ===== Error Handling =====

  /**
   * Gérer les erreurs de manière centralisée
   */
  private handleError(error: any, context: string): never {
    console.error(`AlertService error in ${context}:`, error)
    
    // Log l'erreur pour le debugging
    if (import.meta.env.DEV) {
      console.group('AlertService Error Details')
      console.error('Context:', context)
      console.error('Error:', error)
      console.error('Stack:', error.stack)
      console.groupEnd()
    }

    // Relancer l'erreur avec un message plus clair
    throw new Error(`Erreur lors de ${context}: ${error.message}`)
  }

  // ===== Cache Management =====

  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()

  /**
   * Mettre en cache une réponse
   */
  private setCache(key: string, data: any, ttl: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  /**
   * Récupérer du cache
   */
  private getCache<T>(key: string): T | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const isExpired = Date.now() - cached.timestamp > cached.ttl
    if (isExpired) {
      this.cache.delete(key)
      return null
    }

    return cached.data as T
  }

  /**
   * Vider le cache
   */
  clearCache(): void {
    this.cache.clear()
  }

  /**
   * Récupérer les types d'alertes avec cache
   */
  async getAlertTypesCached(): Promise<AlertType[]> {
    const cacheKey = 'alert-types'
    const cached = this.getCache<AlertType[]>(cacheKey)
    
    if (cached) {
      return cached
    }

    try {
      const data = await this.getAlertTypes()
      this.setCache(cacheKey, data, 10 * 60 * 1000) // Cache 10 minutes
      return data
    } catch (error) {
      this.handleError(error, 'getAlertTypesCached')
    }
  }
}

// Instance singleton
export const alertService = new AlertService()

// Les types sont déjà exportés au début du fichier 