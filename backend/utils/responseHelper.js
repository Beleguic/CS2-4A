/**
 * Utilitaires pour standardiser les réponses API
 */

const sendError = (res, statusCode, message, details = null) => {
  const response = {
    error: true,
    message: message
  };
  
  if (details) {
    response.details = details;
  }
  
  return res.status(statusCode).json(response);
};

const sendSuccess = (res, statusCode, data = null, message = null) => {
  const response = {
    success: true
  };
  
  if (message) {
    response.message = message;
  }
  
  if (data) {
    response.data = data;
  }
  
  return res.status(statusCode).json(response);
};

const sendNotFound = (res, resource = 'Ressource') => {
  return sendError(res, 404, `${resource} non trouvé(e)`);
};

const sendUnauthorized = (res, message = 'Non autorisé') => {
  return sendError(res, 401, message);
};

const sendForbidden = (res, message = 'Accès interdit') => {
  return sendError(res, 403, message);
};

const sendValidationError = (res, details) => {
  return sendError(res, 400, 'Erreur de validation', details);
};

const sendConflict = (res, message = 'Conflit de données') => {
  return sendError(res, 409, message);
};

const sendInternalError = (res, message = 'Erreur interne du serveur') => {
  return sendError(res, 500, message);
};

module.exports = {
  sendError,
  sendSuccess,
  sendNotFound,
  sendUnauthorized,
  sendForbidden,
  sendValidationError,
  sendConflict,
  sendInternalError
};
