import { useToast as useVueToast } from 'vue-toast-notification';

export function useToast() {
  const $toast = useVueToast();

  const toast = {
    error: (message: string, duration: number = 5000) => {
      $toast.open({
        message,
        type: 'error',
        position: 'bottom-left',
        duration,
      });
    },

    success: (message: string, duration: number = 3000) => {
      $toast.open({
        message,
        type: 'success',
        position: 'bottom-left',
        duration,
      });
    },

    warning: (message: string, duration: number = 4000) => {
      $toast.open({
        message,
        type: 'warning',
        position: 'bottom-left',
        duration,
      });
    },

    info: (message: string, duration: number = 3000) => {
      $toast.open({
        message,
        type: 'info',
        position: 'bottom-left',
        duration,
      });
    },

    // Méthodes spécialisées pour des cas d'usage courants
    apiError: (error: any, defaultMessage: string = 'Une erreur est survenue') => {
      console.error('API Error:', error);
      
      let message = defaultMessage;
      
      // Gestion des erreurs de parsing JSON
      if (error?.message?.includes('JSON.parse')) {
        message = 'Erreur de communication avec le serveur';
      } else if (error?.response?.data?.message) {
        message = error.response.data.message;
      } else if (error?.response?.status) {
        // Gestion des codes d'erreur HTTP
        switch (error.response.status) {
          case 400:
            message = 'Requête invalide';
            break;
          case 401:
            message = 'Non autorisé';
            break;
          case 403:
            message = 'Accès refusé';
            break;
          case 404:
            message = 'Ressource non trouvée';
            break;
          case 500:
            message = 'Erreur interne du serveur';
            break;
          default:
            message = `Erreur ${error.response.status}`;
        }
      } else if (error?.message) {
        message = error.message;
      } else if (typeof error === 'string') {
        message = error;
      }

      $toast.open({
        message,
        type: 'error',
        position: 'bottom-left',
        duration: 5000,
      });
    },

    validationError: (message: string = 'Veuillez corriger les erreurs du formulaire') => {
      $toast.open({
        message,
        type: 'warning',
        position: 'bottom-left',
        duration: 4000,
      });
    },

    networkError: (error?: any) => {
      let message = 'Erreur de connexion. Vérifiez votre connexion internet.';
      
      if (error?.message?.includes('JSON.parse')) {
        message = 'Erreur de communication avec le serveur (réponse invalide)';
      } else if (error?.code === 'NETWORK_ERROR') {
        message = 'Impossible de joindre le serveur';
      } else if (error?.message?.includes('fetch')) {
        message = 'Erreur de récupération des données';
      }
      
      $toast.open({
        message,
        type: 'error',
        position: 'bottom-left',
        duration: 6000,
      });
    },

    unauthorized: () => {
      $toast.open({
        message: 'Votre session a expiré. Veuillez vous reconnecter.',
        type: 'warning',
        position: 'bottom-left',
        duration: 5000,
      });
    },

    notFound: (resource: string = 'Ressource') => {
      $toast.open({
        message: `${resource} non trouvé(e)`,
        type: 'warning',
        position: 'bottom-left',
        duration: 4000,
      });
    },

    saved: (resource: string = 'Données') => {
      $toast.open({
        message: `${resource} sauvegardé(e) avec succès`,
        type: 'success',
        position: 'bottom-left',
        duration: 3000,
      });
    },

    deleted: (resource: string = 'Élément') => {
      $toast.open({
        message: `${resource} supprimé(e) avec succès`,
        type: 'success',
        position: 'bottom-left',
        duration: 3000,
      });
    },

    updated: (resource: string = 'Données') => {
      $toast.open({
        message: `${resource} mis(e) à jour avec succès`,
        type: 'success',
        position: 'bottom-left',
        duration: 3000,
      });
    },

    loading: (message: string = 'Chargement...') => {
      $toast.open({
        message,
        type: 'info',
        position: 'bottom-left',
        duration: 2000,
      });
    }
  };

  return toast;
}
