const { ProductPromotion, Product } = require('../models');
const Joi = require('joi');

// ProductPromotion schema validation
const productPromotionSchema = Joi.object({
  product_id: Joi.string().uuid().required(),
  start_at: Joi.date().required(),
  end_at: Joi.date().required(),
});

// Function to filter out disallowed fields
const filterPromotionFields = (promotion) => {
  const { product, ...filteredPromotion } = promotion;
  return filteredPromotion;
};

const getAllProductPromotions = async (req, res, next) => {
  try {
    const productPromotions = await ProductPromotion.findAll({
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });
    res.json(productPromotions);
  } catch (e) {
    next(e);
  }
};

const getProductPromotionById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const productPromotion = await ProductPromotion.findByPk(id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });

    if (productPromotion) {
      res.json(productPromotion);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const createProductPromotion = async (req, res, next) => {
  try {
    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productPromotion = await ProductPromotion.create(req.body);
    res.status(201).json(productPromotion);
  } catch (e) {
    next(e);
  }
};

const updateProductPromotion = async (req, res, next) => {
  try {
    const filteredBody = filterPromotionFields(req.body); // Filter the fields
    const { error } = productPromotionSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productPromotion = await ProductPromotion.findByPk(req.params.id);

    if (productPromotion) {
      await productPromotion.update(filteredBody);
      res.json(productPromotion);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
};

const deleteProductPromotion = async (req, res, next) => {
  try {
    const nbDeleted = await ProductPromotion.destroy({
      where: {
        id: req.params.id,
      },
    });
    if (nbDeleted === 1) {
      res.sendStatus(204);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
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
