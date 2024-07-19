import { reactive } from 'vue';
import { z } from 'zod';

export function useFormValidation(fields) {
  const formData = reactive({});
  const errors = reactive({});

  fields.forEach(field => {
    formData[field.name] = field.type === 'select' ? [] : '';
  });

  const schema = z.object(
    fields.reduce((acc, field) => {
      let fieldSchema = field.type === 'select' ? z.array(z.string()) : z.string();
      if (field.required) {
        fieldSchema = fieldSchema.nonempty(`${field.label} est requis`);
      }
      if (field.type === 'email') {
        fieldSchema = fieldSchema.email(`${field.label} doit être une adresse email valide`);
      }
      if (field.name === 'password') {
        fieldSchema = fieldSchema.min(12, 'Le mot de passe doit contenir au moins 12 caractères').regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\\-])[A-Za-z\d@$!%*?&_\\-]{12,}$/,
          'Le mot de passe doit contenir des majuscules, des minuscules, des chiffres et des symboles'
        );
      }
      acc[field.name] = fieldSchema;
      return acc;
    }, {})
  );

  const validateForm = (data) => {
    const result = schema.safeParse(data);
    if (!result.success) {
      result.error.errors.forEach(err => {
        errors[err.path[0]] = err.message;
      });
      return errors;
    }
    return {};
  };

  const resetErrors = () => {
    Object.keys(errors).forEach(key => {
      errors[key] = '';
    });
  };

  return {
    formData,
    errors,
    validateForm,
    resetErrors,
  };
}
