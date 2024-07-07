const express = require('express');
const { ProductPromotion, Product } = require('../models');
const router = express.Router();
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

// Get all product promotions
router.get('/', async (req, res, next) => {
  try {
    const productPromotions = await ProductPromotion.findAll({
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });
    res.json(productPromotions);
  } catch (e) {
    console.error('Error fetching product promotions:', e);
    next(e);
  }
});

// Get product promotion by ID
router.get('/:id', async (req, res, next) => {
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
    console.error('Error fetching product promotion by ID:', e);
    next(e);
  }
});

// Create new product promotion
router.post('/new', async (req, res, next) => {
  try {
    const { error } = productPromotionSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const productPromotion = await ProductPromotion.create(req.body);
    res.status(201).json(productPromotion);
  } catch (e) {
    console.error('Error creating product promotion:', e);
    next(e);
  }
});

// Update product promotion
router.patch('/:id', async (req, res, next) => {
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
    console.error('Error updating product promotion:', e);
    next(e);
  }
});

// Delete product promotion
router.delete('/:id', async (req, res, next) => {
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
    console.error('Error deleting product promotion:', e);
    next(e);
  }
});

module.exports = router;
