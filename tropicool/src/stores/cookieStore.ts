import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface CookiePreferences {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
}

export const useCookieStore = defineStore('cookies', () => {
  // État des préférences de cookies
  const preferences = ref<CookiePreferences>({
    essential: true, // Toujours activé
    analytics: false,
    marketing: false
  });

  // État du consentement
  const consentGiven = ref(false);

  // Getters
  const hasConsent = computed(() => consentGiven.value);
  
  const hasAnalyticsConsent = computed(() => 
    consentGiven.value && preferences.value.analytics
  );
  
  const hasMarketingConsent = computed(() => 
    consentGiven.value && preferences.value.marketing
  );

  const hasEssentialConsent = computed(() => 
    consentGiven.value && preferences.value.essential
  );

  // Actions
  const loadPreferences = () => {
    try {
      const savedConsent = localStorage.getItem('tropicool-cookie-consent');
      if (savedConsent) {
        const consent = JSON.parse(savedConsent);
        preferences.value = { ...preferences.value, ...consent };
        consentGiven.value = true;
      }
    } catch (error) {
      console.error('Erreur lors du chargement des préférences cookies:', error);
    }
  };

  const savePreferences = async (newPreferences: Partial<CookiePreferences>) => {
    try {
      // Mettre à jour les préférences
      preferences.value = { ...preferences.value, ...newPreferences };
      
      // Sauvegarder dans localStorage
      localStorage.setItem('tropicool-cookie-consent', JSON.stringify(preferences.value));
      
      // Marquer comme accepté
      consentGiven.value = true;
      
      // Envoyer au backend si possible
      try {
        const apiUrl = import.meta.env.VITE_API_URL as string;
        await fetch(`${apiUrl}/cookieConsent/save`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(preferences.value)
        });
      } catch (apiError) {
        console.warn('Impossible de sauvegarder le consentement côté serveur:', apiError);
        // On continue même si l'API échoue, le localStorage est suffisant
      }
      
      return true;
    } catch (error) {
      console.error('Erreur lors de la sauvegarde des préférences cookies:', error);
      return false;
    }
  };

  const acceptAll = async () => {
    return await savePreferences({
      essential: true,
      analytics: true,
      marketing: true
    });
  };

  const rejectAll = async () => {
    return await savePreferences({
      essential: true,
      analytics: false,
      marketing: false
    });
  };

  const acceptSelected = async () => {
    return await savePreferences(preferences.value);
  };

  const updatePreference = (key: keyof CookiePreferences, value: boolean) => {
    preferences.value[key] = value;
  };

  const resetPreferences = () => {
    preferences.value = {
      essential: true,
      analytics: false,
      marketing: false
    };
    consentGiven.value = false;
    localStorage.removeItem('tropicool-cookie-consent');
  };

  // Fonction pour vérifier si on peut utiliser un type de cookie
  const canUseCookie = (type: keyof CookiePreferences): boolean => {
    if (!consentGiven.value) return false;
    return preferences.value[type];
  };

  // Fonction pour obtenir les préférences actuelles
  const getCurrentPreferences = (): CookiePreferences => {
    return { ...preferences.value };
  };

  return {
    // État
    preferences,
    consentGiven,
    
    // Getters
    hasConsent,
    hasAnalyticsConsent,
    hasMarketingConsent,
    hasEssentialConsent,
    
    // Actions
    loadPreferences,
    savePreferences,
    acceptAll,
    rejectAll,
    acceptSelected,
    updatePreference,
    resetPreferences,
    canUseCookie,
    getCurrentPreferences
  };
}); 