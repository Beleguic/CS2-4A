const express = require('express');
const { Alert, Product, Category } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Alert schema validation
const alertSchema = Joi.object({
  alert_type_id: Joi.number().integer().required(),
  product_id: Joi.string().uuid().optional().allow(null),
  category_id: Joi.string().uuid().optional().allow(null),
});

// Get all alerts
router.get('/', async (req, res, next) => {
  try {
    const alerts = await Alert.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });
    res.json(alerts);
  } catch (e) {
    next(e);
  }
});

// Get alert by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const alert = await Alert.findByPk(id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name'] },
        { model: Category, as: 'category', attributes: ['id', 'name'] },
      ],
    });

    if (alert) {
      res.json(alert);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

// Create new alert
router.post('/new', async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alert = await Alert.create(req.body);
    res.status(201).json(alert);
  } catch (e) {
    next(e);
  }
});

// Update alert
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = alertSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alert = await Alert.findByPk(req.params.id);

    if (alert) {
      await alert.update(req.body);
      res.json(alert);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

// Delete alert
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Alert.destroy({
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
});

module.exports = router;
