const express = require('express');
const { AlertType } = require('../models');
const router = express.Router();
const Joi = require('joi');

// AlertType schema validation
const alertTypeSchema = Joi.object({
  type: Joi.string().min(3).max(255).required(),
});

// Get all alert types
router.get('/', async (req, res, next) => {
  try {
    const alertTypes = await AlertType.findAll();
    res.json(alertTypes);
  } catch (e) {
    console.error('Error fetching alert types:', e);
    next(e);
  }
});

// Get alert type by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const alertType = await AlertType.findByPk(id);

    if (alertType) {
      res.json(alertType);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching alert type by ID:', e);
    next(e);
  }
});

// Create new alert type
router.post('/new', async (req, res, next) => {
  try {
    console.log('Received payload for new alert type:', req.body); // Log received payload

    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      console.error('Validation error:', error.details); // Log validation error details
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertType = await AlertType.create(req.body);
    res.status(201).json(alertType);
  } catch (e) {
    console.error('Error creating alert type:', e); // Log the full error
    next(e);
  }
});

// Update alert type
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = alertTypeSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const alertType = await AlertType.findByPk(req.params.id);

    if (alertType) {
      await alertType.update(req.body);
      res.json(alertType);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating alert type:', e);
    next(e);
  }
});

// Delete alert type
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await AlertType.destroy({
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
    console.error('Error deleting alert type:', e);
    next(e);
  }
});

module.exports = router;
