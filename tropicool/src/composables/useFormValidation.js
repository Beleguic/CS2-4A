import { reactive } from 'vue';
import { z } from 'zod';

export function useFormValidation(fields) {
  const formData = reactive({});
  const errors = reactive({});

  fields.forEach(field => {
    formData[field.name] = '';
  });

  const schema = z.object(
    fields.reduce((acc, field) => {
      let fieldSchema = z.string();
      if (field.required) {
        fieldSchema = fieldSchema.nonempty(`${field.label} est requis`);
      }
      if (field.type === 'email') {
        fieldSchema = fieldSchema.email(`${field.label} doit être une adresse email valide`);
      }
      if (field.name === 'password') {
        fieldSchema = fieldSchema.min(12, 'Le mot de passe doit contenir au moins 12 caractères').regex(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\\\-])[A-Za-z\d@$!%*?&_\\\-]{12,}$/,
          'Le mot de passe doit contenir des majuscules, des minuscules, des chiffres et des symboles'
        );
      }
      acc[field.name] = fieldSchema;
      return acc;
    }, {})
  );

  const validateForm = () => {
    const result = schema.safeParse(formData);
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
