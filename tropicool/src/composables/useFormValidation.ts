import { ref, reactive, computed, readonly } from 'vue';
import { z } from 'zod';
import { useToast } from 'vue-toast-notification';

export interface FormState {
  data: Record<string, any>;
  errors: Record<string, string>;
  isLoading: boolean;
  isSubmitted: boolean;
  serverError: string | null;
}

export interface FormOptions {
  initialData: Record<string, any>;
  schema: z.ZodSchema<any>;
  onSubmit: (data: Record<string, any>) => Promise<boolean>;
  onSuccess?: (data: Record<string, any>) => void;
  onError?: (error: string) => void;
  transformData?: (data: Record<string, any>) => any;
  validateOnChange?: boolean;
  resetOnSuccess?: boolean;
}

export function useFormValidation(options: FormOptions) {
  const $toast = useToast();
  
  // État du formulaire
  const formState = reactive<FormState>({
    data: { ...options.initialData },
    errors: {},
    isLoading: false,
    isSubmitted: false,
    serverError: null
  });

  // Contrôleur d'annulation pour les requêtes
  const abortController = ref<AbortController | null>(null);

  // Computed pour vérifier si le formulaire est valide
  const isValid = computed(() => {
    try {
      options.schema.parse(formState.data);
      return true;
    } catch {
      return false;
    }
  });

  // Computed pour vérifier s'il y a des erreurs
  const hasErrors = computed(() => {
    return Object.keys(formState.errors).length > 0 || !!formState.serverError;
  });

  // Computed pour vérifier si le formulaire peut être soumis
  const canSubmit = computed(() => {
    return !formState.isLoading && isValid.value && !formState.isSubmitted;
  });

  // Fonction de validation complète du formulaire
  const validateForm = (): boolean => {
    try {
      options.schema.parse(formState.data);
      formState.errors = {};
      formState.serverError = null;
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        formState.errors = {};
        error.errors.forEach(err => {
          const field = err.path[0] as string;
          if (field) {
            formState.errors[field] = err.message;
          }
        });
      }
      return false;
    }
  };

  // Fonction de mise à jour d'un champ
  const updateField = (field: string, value: any) => {
    formState.data[field] = value;
    
    // Valider le champ si l'option est activée
    if (options.validateOnChange) {
      validateForm();
    }
  };

  // Fonction de réinitialisation du formulaire
  const resetForm = () => {
    formState.data = { ...options.initialData };
    formState.errors = {};
    formState.isLoading = false;
    formState.isSubmitted = false;
    formState.serverError = null;
    
    // Annuler la requête en cours si elle existe
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
    }
  };

  // Fonction de soumission du formulaire
  const submitForm = async (): Promise<boolean> => {
    // Annuler la requête précédente si elle existe
    if (abortController.value) {
      abortController.value.abort();
    }

    // Créer un nouveau contrôleur d'annulation
    abortController.value = new AbortController();

    // Réinitialiser les erreurs
    formState.errors = {};
    formState.serverError = null;
    formState.isSubmitted = false;

    // Valider le formulaire
    if (!validateForm()) {
      $toast.open({
        message: 'Veuillez corriger les erreurs dans le formulaire',
        type: 'error',
        position: 'bottom-left',
        duration: 4000
      });
      return false;
    }

    // Marquer comme en cours de chargement
    formState.isLoading = true;

    try {
      // Préparer les données (avec transformation si nécessaire)
      const dataToSubmit = options.transformData ? options.transformData(formState.data) : formState.data;

      // Soumettre le formulaire
      const success = await options.onSubmit(dataToSubmit);

      if (success) {
        // Succès
        formState.isSubmitted = true;
        
        // Appeler le callback de succès
        if (options.onSuccess) {
          options.onSuccess(formState.data);
        }

        // Réinitialiser si l'option est activée
        if (options.resetOnSuccess) {
          resetForm();
        }

        return true;
      } else {
        // Échec silencieux
        formState.serverError = 'Une erreur est survenue lors de la soumission';
        return false;
      }
    } catch (error) {
      // Gestion d'erreur
      let errorMessage = 'Une erreur inattendue est survenue';

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          // Requête annulée
          return false;
        }
        errorMessage = error.message;
      } else if (typeof error === 'string') {
        errorMessage = error;
      }

      formState.serverError = errorMessage;

      // Appeler le callback d'erreur
      if (options.onError) {
        options.onError(errorMessage);
      }

      $toast.open({
        message: errorMessage,
        type: 'error',
        position: 'bottom-left',
        duration: 5000
      });

      return false;
    } finally {
      formState.isLoading = false;
      abortController.value = null;
    }
  };

  // Fonction d'annulation de la requête en cours
  const cancelRequest = () => {
    if (abortController.value) {
      abortController.value.abort();
      abortController.value = null;
      formState.isLoading = false;
    }
  };

  // Fonction pour définir une erreur serveur
  const setServerError = (error: string) => {
    formState.serverError = error;
  };

  // Fonction pour effacer les erreurs
  const clearErrors = () => {
    formState.errors = {};
    formState.serverError = null;
  };

  // Fonction pour définir une erreur de champ spécifique
  const setFieldError = (field: string, error: string) => {
    formState.errors[field] = error;
  };

  // Fonction pour effacer l'erreur d'un champ spécifique
  const clearFieldError = (field: string) => {
    delete formState.errors[field];
  };

  // Fonction pour obtenir l'erreur d'un champ
  const getFieldError = (field: string): string | undefined => {
    return formState.errors[field];
  };

  // Fonction pour vérifier si un champ a une erreur
  const hasFieldError = (field: string): boolean => {
    return !!formState.errors[field];
  };

  return {
    // État réactif
    formState: readonly(formState),
    
    // Computed
    isValid,
    hasErrors,
    canSubmit,
    
    // Méthodes de validation
    validateForm,
    
    // Méthodes de gestion des données
    updateField,
    resetForm,
    
    // Méthodes de soumission
    submitForm,
    cancelRequest,
    
    // Méthodes de gestion des erreurs
    setServerError,
    clearErrors,
    setFieldError,
    clearFieldError,
    getFieldError,
    hasFieldError
  };
}

// Fonction utilitaire pour créer un schéma de validation commun
export const createFormSchema = {
  // Schéma pour email
  email: z.string().email('Adresse email invalide'),
  
  // Schéma pour mot de passe (CNIL)
  password: z.string()
    .min(12, 'Le mot de passe doit contenir au moins 12 caractères')
    .regex(/[a-z]/, 'Le mot de passe doit contenir au moins une minuscule')
    .regex(/[A-Z]/, 'Le mot de passe doit contenir au moins une majuscule')
    .regex(/[0-9]/, 'Le mot de passe doit contenir au moins un chiffre')
    .regex(/[^a-zA-Z0-9]/, 'Le mot de passe doit contenir au moins un symbole'),
  
  // Schéma pour nom/prénom
  name: z.string()
    .min(2, 'Le nom doit contenir au moins 2 caractères')
    .max(50, 'Le nom ne peut pas dépasser 50 caractères')
    .regex(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Le nom ne peut contenir que des lettres'),
  
  // Schéma pour nom d'utilisateur
  username: z.string()
    .min(3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères')
    .max(30, 'Le nom d\'utilisateur ne peut pas dépasser 30 caractères')
    .regex(/^[a-zA-Z0-9_-]+$/, 'Le nom d\'utilisateur ne peut contenir que des lettres, chiffres, tirets et underscores'),
  
  // Schéma pour date de naissance
  dateOfBirth: z.string()
    .refine((date) => {
      const birthDate = new Date(date);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      return age >= 18 && age <= 120;
    }, 'Vous devez avoir entre 18 et 120 ans'),
  
  // Schéma pour téléphone
  phone: z.string()
    .regex(/^(\+33|0)[1-9](\d{8})$/, 'Numéro de téléphone invalide'),
  
  // Schéma pour code postal
  postalCode: z.string()
    .regex(/^[0-9]{5}$/, 'Code postal invalide'),
  
  // Schéma pour prix
  price: z.number()
    .min(0, 'Le prix ne peut pas être négatif')
    .max(999999.99, 'Le prix ne peut pas dépasser 999 999,99 €'),
  
  // Schéma pour quantité
  quantity: z.number()
    .int('La quantité doit être un nombre entier')
    .min(1, 'La quantité doit être au moins de 1')
    .max(999999, 'La quantité ne peut pas dépasser 999 999')
}; 