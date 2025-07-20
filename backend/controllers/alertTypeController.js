const { AlertType } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// AlertType schema validation
const alertTypeSchema = Joi.object({
  type: Joi.string().required(),
  name: Joi.string().required(),
  description: Joi.string().optional()
});

const getAllAlertTypes = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0
    };

    const alertTypes = await readService.getAllAlertTypes(filters);
    
    // Formater la réponse
    const formattedAlertTypes = alertTypes.map(alertType => ({
      id: alertType._id,
      type: alertType.type,
      name: alertType.name,
      description: alertType.description,
      created_at: alertType.created_at,
      updated_at: alertType.updated_at
    }));

    res.json(formattedAlertTypes);
  } catch (e) {
    console.error('Error fetching alert types:', e);
    next(e);
  }
};

const getAlertTypeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const alertType = await readService.getAlertTypeById(id);

    if (alertType) {
      // Formater la réponse
      const formattedAlertType = {
        id: alertType._id,
        type: alertType.type,
        name: alertType.name,
        description: alertType.description,
        created_at: alertType.created_at,
        updated_at: alertType.updated_at
      };
      
      res.json(formattedAlertType);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching alert type by ID:', e);
    next(e);
  }
};

const createAlertType = async (req, res, next) => {
  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const alertType = await AlertType.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncAlertTypes();
    
    res.status(201).json(alertType);
  } catch (e) {
    console.error('Error creating alert type:', e);
    next(e);
  }
};

const updateAlertType = async (req, res, next) => {
  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertType = await AlertType.findByPk(req.params.id);

    if (alertType) {
      await alertType.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncAlertTypes();
      
      res.json(alertType);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating alert type:', e);
    next(e);
  }
};

const deleteAlertType = async (req, res, next) => {
  try {
    const nbDeleted = await AlertType.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.AlertType.findByIdAndDelete(req.params.id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting alert type:', e);
    next(e);
  }
};

module.exports = {
  getAllAlertTypes,
  getAlertTypeById,
  createAlertType,
  updateAlertType,
  deleteAlertType,
};
