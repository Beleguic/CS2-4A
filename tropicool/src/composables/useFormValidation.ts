import { reactive, computed } from 'vue';
import { z, ZodIssue, ZodObject } from 'zod';
import { useErrorHandler } from './useErrorHandler';

interface Field {
  type: string;
  name: string;
  label: string;
  required?: boolean;
}

interface FieldGroup {
  field: Field[][];
}

interface FormData {
  [key: string]: string | boolean;
}

interface Errors {
  [key: string]: string;
}

export function useFormValidation(fields: FieldGroup[]) {
  const { handleError } = useErrorHandler();
  const formData: FormData = reactive({});
  const errors: Errors = reactive({});
  const isSubmitting = reactive({ value: false });

  // Initialiser les données du formulaire
  fields.forEach(fieldGroup => {
    fieldGroup.field.forEach(subFieldArray => {
      subFieldArray.forEach(subField => {
        if (subField.type === 'checkbox') {
          formData[subField.name] = false;
        } else if (subField.type === 'number') {
          formData[subField.name] = 0;
        } else {
          formData[subField.name] = '';
        }
      });
    });
  });

  // Computed pour vérifier si le formulaire est valide
  const isValid = computed(() => {
    return Object.keys(errors).length === 0 && 
           Object.values(errors).every(error => error === '');
  });

  const schema: ZodObject<any> = z.object(
    fields.reduce((acc, fieldGroup) => {
      fieldGroup.field.forEach(subFieldArray => {
        subFieldArray.forEach(subField => {
          let fieldSchema;
          if (subField.type === 'checkbox') {
            fieldSchema = z.boolean();
          } else if (subField.type === 'number') {
            fieldSchema = z.number();
          } else {
            fieldSchema = z.string();
            if (subField.required) {
              fieldSchema = fieldSchema.nonempty(`${subField.label} est requis`);
            }
            if (subField.type === 'email') {
              fieldSchema = fieldSchema.email(`${subField.label} doit être une adresse email valide`);
            }
            if (subField.name === 'password') {
              fieldSchema = fieldSchema.min(12, 'Le mot de passe doit contenir au moins 12 caractères').regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\\-])[A-Za-z\d@$!%*?&_\\-]{12,}$/,
                'Le mot de passe doit contenir des majuscules, des minuscules, des chiffres et des symboles'
              );
            }
          }
          acc[subField.name] = fieldSchema;
        });
      });
      return acc;
    }, {} as { [key: string]: any })
  );

  const validateForm = () => {
    resetErrors();
    const result = schema.safeParse(formData);
    if (!result.success) {
      result.error.errors.forEach((err: ZodIssue) => {
        errors[err.path[0] as string] = err.message;
      });
      return false;
    }
    return true;
  };

  const resetErrors = () => {
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
  };

  const resetForm = () => {
    Object.keys(formData).forEach(key => {
      const field = fields.flatMap(group => group.field.flat()).find(f => f.name === key);
      if (field?.type === 'checkbox') {
        formData[key] = false;
      } else if (field?.type === 'number') {
        formData[key] = 0;
      } else {
        formData[key] = '';
      }
    });
    resetErrors();
  };

  const submitForm = async (submitFn: (data: FormData) => Promise<void>) => {
    if (!validateForm()) {
      handleError('Veuillez corriger les erreurs du formulaire');
      return;
    }

    isSubmitting.value = true;
    try {
      await submitFn(formData);
    } catch (error) {
      handleError(error, 'Erreur lors de la soumission du formulaire');
    } finally {
      isSubmitting.value = false;
    }
  };

  return {
    formData,
    errors,
    isValid,
    isSubmitting: isSubmitting.value,
    validateForm,
    resetErrors,
    resetForm,
    submitForm,
  };
}
