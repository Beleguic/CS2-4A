import { useToast } from './useToast';

export function useErrorHandler() {
  const toast = useToast();

  const handleError = (error: any, defaultMessage: string = 'Une erreur est survenue') => {
    toast.apiError(error, defaultMessage);
  };

  const handleSuccess = (message: string) => {
    toast.success(message);
  };

  const handleInfo = (message: string) => {
    toast.info(message);
  };

  const handleWarning = (message: string) => {
    toast.warning(message);
  };

  return {
    handleError,
    handleSuccess,
    handleInfo,
    handleWarning,
    toast // Exposer l'objet toast complet pour plus de flexibilité
  };
}
