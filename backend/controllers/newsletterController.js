const { Newsletter, User } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// Newsletter schema validation
const newsletterSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  email: Joi.string().email().required(),
  is_active: Joi.boolean().optional(),
  preferences: Joi.object().optional()
});

const getAllNewsletters = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      user_id: req.query.user_id,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };

    const newsletters = await readService.getAllNewsletters(filters);
    
    // Formater la réponse
    const formattedNewsletters = newsletters.map(newsletter => ({
      id: newsletter._id,
      user_id: newsletter.user_id,
      email: newsletter.email,
      is_active: newsletter.is_active,
      preferences: newsletter.preferences,
      created_at: newsletter.created_at,
      updated_at: newsletter.updated_at,
      user: newsletter.user
    }));

    res.json(formattedNewsletters);
  } catch (e) {
    console.error('Error fetching newsletters:', e);
    next(e);
  }
};

const getNewsletterById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const newsletter = await readService.getNewsletterById(id);

    if (newsletter) {
      // Formater la réponse
      const formattedNewsletter = {
        id: newsletter._id,
        user_id: newsletter.user_id,
        email: newsletter.email,
        is_active: newsletter.is_active,
        preferences: newsletter.preferences,
        created_at: newsletter.created_at,
        updated_at: newsletter.updated_at,
        user: newsletter.user
      };
      
      res.json(formattedNewsletter);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching newsletter by ID:', e);
    next(e);
  }
};

const createNewsletter = async (req, res, next) => {
  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const newsletter = await Newsletter.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncUser(newsletter.user_id);
    
    res.status(201).json(newsletter);
  } catch (e) {
    console.error('Error creating newsletter:', e);
    next(e);
  }
};

const updateNewsletter = async (req, res, next) => {
  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newsletter = await Newsletter.findByPk(req.params.id);

    if (newsletter) {
      await newsletter.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncUser(newsletter.user_id);
      
      res.json(newsletter);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating newsletter:', e);
    next(e);
  }
};

const deleteNewsletter = async (req, res, next) => {
  try {
    const newsletter = await Newsletter.findByPk(req.params.id);
    
    if (!newsletter) {
      return res.sendStatus(404);
    }

    const nbDeleted = await Newsletter.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.Newsletter.findByIdAndDelete(req.params.id);
      
      // Synchroniser l'utilisateur
      await denormalizationService.syncUser(newsletter.user_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting newsletter:', e);
    next(e);
  }
};

module.exports = {
  getAllNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
};
