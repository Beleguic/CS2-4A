import { reactive } from 'vue';
import { z } from 'zod';

export function useFormValidation(fields) {
  const formData = reactive({});
  const errors = reactive({});

  fields.forEach(fieldGroup => {
    fieldGroup.field.forEach(subFieldArray => {
      subFieldArray.forEach(subField => {
        if (subField.type === 'checkbox') {
          formData[subField.name] = false;
        } else {
          formData[subField.name] = '';
        }
      });
    });
  });

  const schema = z.object(
    fields.reduce((acc, fieldGroup) => {
      fieldGroup.field.forEach(subFieldArray => {
        subFieldArray.forEach(subField => {
          let fieldSchema;
          if (subField.type === 'checkbox') {
            fieldSchema = z.boolean();
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
