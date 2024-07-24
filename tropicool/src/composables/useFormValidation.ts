import { reactive } from 'vue';
import { z, ZodIssue, ZodObject } from 'zod';

interface Field {
  type: string;
  name: string;
  label: string;
  required?: boolean;
  min : number
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
  const formData: FormData = reactive({});
  const errors: Errors = reactive({});

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
              fieldSchema = fieldSchema.min(subField.min, `${subField.label} est requis`);
            }
            if (subField.type === 'email') {
              fieldSchema = fieldSchema.email(`${subField.label} doit être une adresse email valide`);
            }
            if (subField.name === 'password') {
              fieldSchema = fieldSchema.min(12, 'Le mot de passe doit contenir au moins 12 caractères').regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&_\\\-./#()[\]])[A-Za-z\d@$!%*?&_\\\-./#()[\]]{12,}$/,
                'Le mot de passe doit contenir des majuscules, des minuscules, des chiffres et des symboles (@, $, !, %, *, ?, &, _, -, ., /, #, (, ), [, ])'
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
    const result = schema.safeParse(formData);
    if (!result.success) {
      result.error.errors.forEach((err: ZodIssue) => {
        errors[err.path[0] as string] = err.message;
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
