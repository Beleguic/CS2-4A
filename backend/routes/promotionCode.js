const express = require('express');
const { PromotionCode, Product, Category } = require('../models');
const router = express.Router();
const Joi = require('joi');

// PromotionCode schema validation
const promotionCodeSchema = Joi.object({
  product_id: Joi.string().uuid().allow(null),
  category_id: Joi.string().uuid().allow(null),
  code: Joi.string().required(),
  start_at: Joi.date().required(),
  end_at: Joi.date().required(),
});

// Get all promotion codes
router.get('/', async (req, res, next) => {
  try {
    const promotionCodes = await PromotionCode.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });
    res.json(promotionCodes);
  } catch (e) {
    console.error('Error fetching promotion codes:', e);
    next(e);
  }
});

// Get promotion code by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const promotionCode = await PromotionCode.findByPk(id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    if (promotionCode) {
      res.json(promotionCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching promotion code by ID:', e);
    next(e);
  }
});

// Create new promotion code
router.post('/new', async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.create(req.body);
    res.status(201).json(promotionCode);
  } catch (e) {
    console.error('Error creating promotion code:', e);
    next(e);
  }
});

// Update promotion code
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = promotionCodeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const promotionCode = await PromotionCode.findByPk(req.params.id);

    if (promotionCode) {
      await promotionCode.update(req.body);
      res.json(promotionCode);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating promotion code:', e);
    next(e);
  }
});

// Delete promotion code
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await PromotionCode.destroy({
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
    console.error('Error deleting promotion code:', e);
    next(e);
  }
});

module.exports = router;
