const { UserHistory, User } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// UserHistory schema validation
const userHistorySchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  action: Joi.string().required(),
  details: Joi.object().optional(),
  ip_address: Joi.string().optional(),
  user_agent: Joi.string().optional()
});

const getAllUserHistories = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      user_id: req.query.user_id,
      action: req.query.action,
      date_from: req.query.date_from,
      date_to: req.query.date_to
    };

    const userHistories = await readService.getAllUserHistories(filters);
    
    // Formater la réponse
    const formattedUserHistories = userHistories.map(history => ({
      id: history._id,
      user_id: history.user_id,
      action: history.action,
      details: history.details,
      ip_address: history.ip_address,
      user_agent: history.user_agent,
      created_at: history.created_at,
      updated_at: history.updated_at,
      user: history.user
    }));

    res.json(formattedUserHistories);
  } catch (e) {
    console.error('Error fetching user histories:', e);
    next(e);
  }
};

const getUserHistoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const userHistory = await readService.getUserHistoryById(id);

    if (userHistory) {
      // Formater la réponse
      const formattedUserHistory = {
        id: userHistory._id,
        user_id: userHistory.user_id,
        action: userHistory.action,
        details: userHistory.details,
        ip_address: userHistory.ip_address,
        user_agent: userHistory.user_agent,
        created_at: userHistory.created_at,
        updated_at: userHistory.updated_at,
        user: userHistory.user
      };
      
      res.json(formattedUserHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching user history by ID:', e);
    next(e);
  }
};

const createUserHistory = async (req, res, next) => {
  try {
    const { error } = userHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const userHistory = await UserHistory.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncUser(userHistory.user_id);
    
    res.status(201).json(userHistory);
  } catch (e) {
    console.error('Error creating user history:', e);
    next(e);
  }
};

const updateUserHistory = async (req, res, next) => {
  try {
    const { error } = userHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userHistory = await UserHistory.findByPk(req.params.id);

    if (userHistory) {
      await userHistory.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(userHistory.user_id);
      
      res.json(userHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user history:', e);
    next(e);
  }
};

const deleteUserHistory = async (req, res, next) => {
  try {
    const userHistory = await UserHistory.findByPk(req.params.id);
    
    if (!userHistory) {
      return res.sendStatus(404);
    }

    const nbDeleted = await UserHistory.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.UserHistory.findByIdAndDelete(req.params.id);
      
      // Synchroniser l'utilisateur
      await denormalizationService.syncUser(userHistory.user_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting user history:', e);
    next(e);
  }
};

module.exports = {
  getAllUserHistories,
  getUserHistoryById,
  createUserHistory,
  updateUserHistory,
  deleteUserHistory,
};
