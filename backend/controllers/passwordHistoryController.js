const { PasswordHistory, User } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// PasswordHistory schema validation
const passwordHistorySchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  password_hash: Joi.string().required(),
  created_at: Joi.date().optional()
});

const getAllPasswordHistories = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      user_id: req.query.user_id
    };

    const passwordHistories = await readService.getAllPasswordHistories(filters);
    
    // Formater la réponse (sans exposer les hashes)
    const formattedPasswordHistories = passwordHistories.map(history => ({
      id: history._id,
      user_id: history.user_id,
      created_at: history.created_at,
      updated_at: history.updated_at,
      user: history.user
    }));

    res.json(formattedPasswordHistories);
  } catch (e) {
    console.error('Error fetching password histories:', e);
    next(e);
  }
};

const getPasswordHistoryById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const passwordHistory = await readService.getPasswordHistoryById(id);

    if (passwordHistory) {
      // Formater la réponse (sans exposer les hashes)
      const formattedPasswordHistory = {
        id: passwordHistory._id,
        user_id: passwordHistory.user_id,
        created_at: passwordHistory.created_at,
        updated_at: passwordHistory.updated_at,
        user: passwordHistory.user
      };
      
      res.json(formattedPasswordHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching password history by ID:', e);
    next(e);
  }
};

const createPasswordHistory = async (req, res, next) => {
  try {
    const { error } = passwordHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const passwordHistory = await PasswordHistory.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncUser(passwordHistory.user_id);
    
    res.status(201).json(passwordHistory);
  } catch (e) {
    console.error('Error creating password history:', e);
    next(e);
  }
};

const updatePasswordHistory = async (req, res, next) => {
  try {
    const { error } = passwordHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const passwordHistory = await PasswordHistory.findByPk(req.params.id);

    if (passwordHistory) {
      await passwordHistory.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(passwordHistory.user_id);
      
      res.json(passwordHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating password history:', e);
    next(e);
  }
};

const deletePasswordHistory = async (req, res, next) => {
  try {
    const passwordHistory = await PasswordHistory.findByPk(req.params.id);
    
    if (!passwordHistory) {
      return res.sendStatus(404);
    }

    const nbDeleted = await PasswordHistory.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.PasswordHistory.findByIdAndDelete(req.params.id);
      
      // Synchroniser l'utilisateur
      await denormalizationService.syncUser(passwordHistory.user_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting password history:', e);
    next(e);
  }
};

module.exports = {
  getAllPasswordHistories,
  getPasswordHistoryById,
  createPasswordHistory,
  updatePasswordHistory,
  deletePasswordHistory,
};
