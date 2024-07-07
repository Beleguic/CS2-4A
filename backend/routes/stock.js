const express = require('express');
const { Stock, Product } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Stock schema validation
const stockSchema = Joi.object({
  quantity: Joi.number().integer().min(0).required(),
  product_id: Joi.string().uuid().required(),
});

// Filtrer les champs non autorisés
const filterStockFields = (stock) => {
  const { product, created_at, ...filteredStock } = stock;
  return filteredStock;
};

// Get all stocks
router.get('/', async (req, res, next) => {
  try {
    const stocks = await Stock.findAll({
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });
    res.json(stocks);
  } catch (e) {
    console.error('Error fetching stocks:', e);
    next(e);
  }
});

// Get stock by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const stock = await Stock.findByPk(id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name'] }]
    });

    if (stock) {
      res.json(stock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching stock by ID:', e);
    next(e);
  }
});

// Create new stock
router.post('/new', async (req, res, next) => {
  try {
    const filteredBody = filterStockFields(req.body);
    const { error } = stockSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const stock = await Stock.create(filteredBody);
    res.status(201).json(stock);
  } catch (e) {
    console.error('Error creating stock:', e);
    next(e);
  }
});

// Update stock
router.patch('/:id', async (req, res, next) => {
  try {
    const filteredBody = filterStockFields(req.body);
    const { error } = stockSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const stock = await Stock.findByPk(req.params.id);

    if (stock) {
      await stock.update(filteredBody);
      res.json(stock);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating stock:', e);
    next(e);
  }
});

// Delete stock
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Stock.destroy({
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
    console.error('Error deleting stock:', e);
    next(e);
  }
});

module.exports = router;
