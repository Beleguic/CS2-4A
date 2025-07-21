import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { useAuthStore } from './authStore'

export interface AlertPreference {
  id?: string
  user_id: string
  alert_type_id: string
  category_id?: string
  product_id?: string
  is_active: boolean
  created_at?: string
  updated_at?: string
}

export interface AlertType {
  id: string
  name: string
  description?: string
  icon?: string
  is_active: boolean
}

export interface CategoryAlert {
  category_id: string
  alert_type_id: string[]
}

export interface ProductAlert {
  product_id: string
  alert_type_id: string[]
}

export interface GeneralAlerts {
  newsletter: boolean
  newProducts: boolean
  promotions: boolean
}

export const useAlertStore = defineStore('alert', () => {
  // État
  const isLoading = ref(false)
  const error = ref<string | null>(null)
  
  // Données
  const alertTypes = ref<AlertType[]>([])
  const userPreferences = ref<AlertPreference[]>([])
  const categories = ref<any[]>([])
  const products = ref<any[]>([])
  
  // Préférences générales
  const generalAlerts = ref<GeneralAlerts>({
    newsletter: false,
    newProducts: false,
    promotions: false
  })
  
  // Alertes par catégorie et produit
  const categoryAlerts = ref<CategoryAlert[]>([])
  const productAlerts = ref<ProductAlert[]>([])

  // Getters
  const hasActiveAlerts = computed(() => {
    return generalAlerts.value.newsletter || 
           generalAlerts.value.newProducts || 
           generalAlerts.value.promotions ||
           categoryAlerts.value.length > 0 ||
           productAlerts.value.length > 0
  })

  const totalAlertCount = computed(() => {
    let count = 0
    if (generalAlerts.value.newsletter) count++
    if (generalAlerts.value.newProducts) count++
    if (generalAlerts.value.promotions) count++
    
    categoryAlerts.value.forEach(alert => {
      count += alert.alert_type_id.length
    })
    
    productAlerts.value.forEach(alert => {
      count += alert.alert_type_id.length
    })
    
    return count
  })

  // Actions
  const loadAlertTypes = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/alert_type`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des types d\'alertes')
      }
      
      alertTypes.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des types d\'alertes:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadCategories = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/category?frontend=true`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des catégories')
      }
      
      categories.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des catégories:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadProducts = async (limit = 100) => {
    try {
      isLoading.value = true
      error.value = null
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/product?frontend=true&limit=${limit}`)
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des produits')
      }
      
      products.value = await response.json()
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des produits:', err)
    } finally {
      isLoading.value = false
    }
  }

  const loadUserPreferences = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const authStore = useAuthStore()
      const userId = authStore.userId
      
      if (!userId) {
        throw new Error('Utilisateur non connecté')
      }
      
      const response = await fetch(`${import.meta.env.VITE_API_URL}/alert/user/${userId}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des préférences')
      }
      
      userPreferences.value = await response.json()
      
      // Mapper les préférences
      mapPreferencesToState()
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors du chargement des préférences:', err)
    } finally {
      isLoading.value = false
    }
  }

  const mapPreferencesToState = () => {
    // Réinitialiser l'état
    generalAlerts.value = {
      newsletter: false,
      newProducts: false,
      promotions: false
    }
    categoryAlerts.value = []
    productAlerts.value = []
    
    // Mapper les préférences générales
    userPreferences.value.forEach(pref => {
      if (!pref.category_id && !pref.product_id) {
        switch (pref.alert_type_id) {
          case 'newsletter':
            generalAlerts.value.newsletter = true
            break
          case 'new_products':
            generalAlerts.value.newProducts = true
            break
          case 'promotions':
            generalAlerts.value.promotions = true
            break
        }
      }
    })
    
    // Mapper les alertes par catégorie
    const categoryMap = new Map<string, string[]>()
    userPreferences.value.forEach(pref => {
      if (pref.category_id) {
        if (!categoryMap.has(pref.category_id)) {
          categoryMap.set(pref.category_id, [])
        }
        categoryMap.get(pref.category_id)!.push(pref.alert_type_id)
      }
    })
    
    categoryMap.forEach((alertTypes, categoryId) => {
      categoryAlerts.value.push({
        category_id: categoryId,
        alert_type_id: alertTypes
      })
    })
    
    // Mapper les alertes par produit
    const productMap = new Map<string, string[]>()
    userPreferences.value.forEach(pref => {
      if (pref.product_id) {
        if (!productMap.has(pref.product_id)) {
          productMap.set(pref.product_id, [])
        }
        productMap.get(pref.product_id)!.push(pref.alert_type_id)
      }
    })
    
    productMap.forEach((alertTypes, productId) => {
      productAlerts.value.push({
        product_id: productId,
        alert_type_id: alertTypes
      })
    })
  }

  const savePreferences = async () => {
    try {
      isLoading.value = true
      error.value = null
      
      const authStore = useAuthStore()
      const userId = authStore.userId
      
      if (!userId) {
        throw new Error('Utilisateur non connecté')
      }
      
      // Préparer les données à sauvegarder
      const alertsToSave: AlertPreference[] = []
      
      // Alertes générales
      if (generalAlerts.value.newsletter) {
        alertsToSave.push({
          user_id: userId,
          alert_type_id: 'newsletter',
          is_active: true
        })
      }
      
      if (generalAlerts.value.newProducts) {
        alertsToSave.push({
          user_id: userId,
          alert_type_id: 'new_products',
          is_active: true
        })
      }
      
      if (generalAlerts.value.promotions) {
        alertsToSave.push({
          user_id: userId,
          alert_type_id: 'promotions',
          is_active: true
        })
      }
      
      // Alertes par catégorie
      categoryAlerts.value.forEach(alert => {
        alert.alert_type_id.forEach(typeId => {
          alertsToSave.push({
            user_id: userId,
            alert_type_id: typeId,
            category_id: alert.category_id,
            is_active: true
          })
        })
      })
      
      // Alertes par produit
      productAlerts.value.forEach(alert => {
        alert.alert_type_id.forEach(typeId => {
          alertsToSave.push({
            user_id: userId,
            alert_type_id: typeId,
            product_id: alert.product_id,
            is_active: true
          })
        })
      })
      
      // Sauvegarder via l'API
      const response = await fetch(`${import.meta.env.VITE_API_URL}/alert/bulk`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ alerts: alertsToSave })
      })
      
      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }
      
      // Recharger les préférences
      await loadUserPreferences()
      
      return true
      
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Erreur inconnue'
      console.error('Erreur lors de la sauvegarde:', err)
      return false
    } finally {
      isLoading.value = false
    }
  }

  const resetPreferences = () => {
    generalAlerts.value = {
      newsletter: false,
      newProducts: false,
      promotions: false
    }
    categoryAlerts.value = []
    productAlerts.value = []
  }

  const updateGeneralAlerts = (alerts: Partial<GeneralAlerts>) => {
    generalAlerts.value = { ...generalAlerts.value, ...alerts }
  }

  const updateCategoryAlerts = (alerts: CategoryAlert[]) => {
    categoryAlerts.value = alerts
  }

  const updateProductAlerts = (alerts: ProductAlert[]) => {
    productAlerts.value = alerts
  }

  const initializeStore = async () => {
    await Promise.all([
      loadAlertTypes(),
      loadCategories(),
      loadProducts(),
      loadUserPreferences()
    ])
  }

  return {
    // État
    isLoading,
    error,
    
    // Données
    alertTypes,
    userPreferences,
    categories,
    products,
    generalAlerts,
    categoryAlerts,
    productAlerts,
    
    // Getters
    hasActiveAlerts,
    totalAlertCount,
    
    // Actions
    loadAlertTypes,
    loadCategories,
    loadProducts,
    loadUserPreferences,
    savePreferences,
    resetPreferences,
    updateGeneralAlerts,
    updateCategoryAlerts,
    updateProductAlerts,
    initializeStore
  }
}) 