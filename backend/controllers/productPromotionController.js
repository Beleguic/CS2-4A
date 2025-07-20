const { ProductPromotion, Product, PromotionCode } = require('../models');
const readService = require('../services/readService');
const denormalizationService = require('../services/denormalizationService');
const Joi = require('joi');

// ProductPromotion schema validation
const productPromotionSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  promotion_code_id: Joi.string().uuid().required(),
  discount_amount: Joi.number().min(0).required(),
  start_date: Joi.date().required(),
  end_date: Joi.date().required(),
  is_active: Joi.boolean().optional()
});

const getAllProductPromotions = async (req, res, next) => {
  try {
    // Utiliser MongoDB pour les lectures
    const filters = {
      limit: parseInt(req.query.limit) || 50,
      offset: parseInt(req.query.offset) || 0,
      product_id: req.query.product_id,
      promotion_code_id: req.query.promotion_code_id,
      is_active: req.query.is_active !== undefined ? req.query.is_active === 'true' : undefined
    };

    const productPromotions = await readService.getAllProductPromotions(filters);
    
    // Formater la réponse
    const formattedProductPromotions = productPromotions.map(promotion => ({
      id: promotion._id,
      product_id: promotion.product_id,
      promotion_code_id: promotion.promotion_code_id,
      discount_amount: promotion.discount_amount,
      start_date: promotion.start_date,
      end_date: promotion.end_date,
      is_active: promotion.is_active,
      created_at: promotion.created_at,
      updated_at: promotion.updated_at,
      product: promotion.product,
      promotionCode: promotion.promotionCode,
      is_expired: promotion.is_expired,
      is_available: promotion.is_available
    }));

    res.json(formattedProductPromotions);
  } catch (e) {
    console.error('Error fetching product promotions:', e);
    next(e);
  }
};

const getProductPromotionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    
    // Utiliser MongoDB pour la lecture
    const promotion = await readService.getProductPromotionById(id);

    if (promotion) {
      // Formater la réponse
      const formattedPromotion = {
        id: promotion._id,
        product_id: promotion.product_id,
        promotion_code_id: promotion.promotion_code_id,
        discount_amount: promotion.discount_amount,
        start_date: promotion.start_date,
        end_date: promotion.end_date,
        is_active: promotion.is_active,
        created_at: promotion.created_at,
        updated_at: promotion.updated_at,
        product: promotion.product,
        promotionCode: promotion.promotionCode,
        is_expired: promotion.is_expired,
        is_available: promotion.is_available
      };
      
      res.json(formattedPromotion);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching product promotion by ID:', e);
    next(e);
  }
};

const createProductPromotion = async (req, res, next) => {
  try {
    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    // Utiliser PostgreSQL pour l'écriture
    const productPromotion = await ProductPromotion.create(req.body);
    
    // Synchroniser vers MongoDB
    await denormalizationService.syncProduct(productPromotion.product_id);
    
    res.status(201).json(productPromotion);
  } catch (e) {
    console.error('Error creating product promotion:', e);
    next(e);
  }
};

const updateProductPromotion = async (req, res, next) => {
  try {
    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productPromotion = await ProductPromotion.findByPk(req.params.id);

    if (productPromotion) {
      await productPromotion.update(req.body);
      
      // Synchroniser vers MongoDB
      await denormalizationService.syncProduct(productPromotion.product_id);
      
      res.json(productPromotion);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating product promotion:', e);
    next(e);
  }
};

const deleteProductPromotion = async (req, res, next) => {
  try {
    const productPromotion = await ProductPromotion.findByPk(req.params.id);
    
    if (!productPromotion) {
      return res.sendStatus(404);
    }

    const nbDeleted = await ProductPromotion.destroy({
      where: {
        id: req.params.id,
      },
    });
    
    if (nbDeleted === 1) {
      // Supprimer de MongoDB aussi
      const mongoDb = require('../mongo');
      await mongoDb.ProductPromotion.findByIdAndDelete(req.params.id);
      
      // Synchroniser le produit
      await denormalizationService.syncProduct(productPromotion.product_id);
      
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting product promotion:', e);
    next(e);
  }
};

module.exports = {
  getAllProductPromotions,
  getProductPromotionById,
  createProductPromotion,
  updateProductPromotion,
  deleteProductPromotion,
};