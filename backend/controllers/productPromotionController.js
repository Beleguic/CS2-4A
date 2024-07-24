const ProductPromotion = require('../mongo/models/ProductPromotion');
const Joi = require('joi');

const productPromotionSchema = Joi.object({
  product_id: Joi.string().required(),
  start_at: Joi.date().required(),
  end_at: Joi.date().required(),
});

const getAllProductPromotions = async (req, res, next) => {
  try {
    const productPromotions = await ProductPromotion.find().populate('product_id', 'id name');
    res.status(200).json(productPromotions);
  } catch (e) {
    console.error('Error fetching product promotions:', e);
    next(e);
  }
};

const getProductPromotionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productPromotion = await ProductPromotion.findById(id).populate('product_id', 'id name');

    if (productPromotion) {
      res.status(200).json(productPromotion);
    } else {
      res.status(404).json({ message: 'Promotion not found' });
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

    const promotion = new ProductPromotion(req.body);
    await promotion.save();
    res.status(201).json(promotion);
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

    const productPromotion = await ProductPromotion.findById(req.params.id);

    if (productPromotion) {
      Object.assign(productPromotion, req.body);
      await productPromotion.save();
      res.status(200).json(productPromotion);
    } else {
      res.status(404).json({ message: 'Promotion not found' });
    }
  } catch (e) {
    console.error('Error updating product promotion:', e);
    next(e);
  }
};

const deleteProductPromotion = async (req, res, next) => {
  try {
    const promotion = await ProductPromotion.findById(req.params.id);
    if (promotion) {
      await promotion.remove();
      res.status(204).send();
    } else {
      res.status(404).json({ message: 'Promotion not found' });
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
