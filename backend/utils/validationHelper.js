/**
 * Utilitaires pour la validation des données
 */

const Joi = require('joi');

// Schémas de validation communs
const commonSchemas = {
  uuid: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(12).pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])')).required()
    .messages({
      'string.pattern.base': 'Le mot de passe doit contenir au moins 12 caractères avec des minuscules, majuscules, chiffres et symboles'
    }),
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10)
  })
};

// Fonction pour valider les données avec Joi
const validateData = (schema, data) => {
  const { error, value } = schema.validate(data, { 
    abortEarly: false,
    stripUnknown: true 
  });
  
  if (error) {
    const details = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    
    return { error: true, details };
  }
  
  return { error: false, data: value };
};

// Fonction pour valider les paramètres de route
const validateParams = (schema, params) => {
  return validateData(schema, params);
};

// Fonction pour valider le body de la requête
const validateBody = (schema, body) => {
  return validateData(schema, body);
};

// Fonction pour valider les query parameters
const validateQuery = (schema, query) => {
  return validateData(schema, query);
};

module.exports = {
  commonSchemas,
  validateData,
  validateParams,
  validateBody,
  validateQuery
};
