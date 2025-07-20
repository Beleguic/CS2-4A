const { PromotionCode } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// PromotionCode schema validation
const promotionCodeSchema = Joi.object({
  code: Joi.string().required(),
  discount_percentage: Joi.number().min(0).max(100).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  is_active: Joi.boolean().optional(),
  max_uses: Joi.number().integer().min(0).optional(),
  current_uses: Joi.number().integer().min(0).optional()
});

const getAllPromotionCodes = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined,
      expired: req.query.expired === 'true'
    };

    const codes = await readService.getAllPromotionCodes(filters);
    
    // Formater la réponse
    const formattedCodes = codes.map(code => ({
      id: code._id,
      code: code.code,
      discount_percentage: code.discount_percentage,
      start_date: code.start_date,
      end_date: code.end_date,
      is_active: code.is_active,
      max_uses: code.max_uses,
      current_uses: code.current_uses,
      created_at: code.created_at,
      updated_at: code.updated_at,
      is_expired: code.is_expired,
      is_available: code.is_available
    }));

    res.json(formattedCodes);
  } catch (e) {
    console.error('Error fetching promotion codes:', e);
    next(e);
  }
};

const getPromotionCodeById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const code = await readService.getPromotionCodeById(id);

    if (code) {
      // Formater la réponse
      const formattedCode = {
        id: code._id,
        code: code.code,
        discount_percentage: code.discount_percentage,
        start_date: code.start_date,
        end_date: code.end_date,
        is_active: code.is_active,
        max_uses: code.max_uses,
        current_uses: code.current_uses,
        created_at: code.created_at,
        updated_at: code.updated_at,
        is_expired: code.is_expired,
        is_available: code.is_available
      };
      
      res.json(formattedCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching promotion code by ID:', e);
    next(e);
  }
};

const createPromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const promotionCode = await PromotionCode.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncPromotionCodes();
    
    res.status(201).json(promotionCode);
  } catch (e) {
    console.error('Error creating promotion code:', e);
    next(e);
  }
};

const updatePromotionCode = async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.findByPk(req.params.id);

    if (promotionCode) {
      await promotionCode.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncPromotionCodes();
      
      res.json(promotionCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating promotion code:', e);
    next(e);
  }
};

const deletePromotionCode = async (req, res, next) => {
  try {
    const nbDeleted = await PromotionCode.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.PromotionCode.findByIdAndDelete(req.params.id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting promotion code:', e);
    next(e);
  }
};

module.exports = {
  getAllPromotionCodes,
  getPromotionCodeById,
  createPromotionCode,
  updatePromotionCode,
  deletePromotionCode,
};
