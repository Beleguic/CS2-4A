const express = require('express');
const { UserHistory } = require('../models');
const router = express.Router();
const Joi = require('joi');

// UserHistory schema validation
const userHistorySchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  is_verified: Joi.boolean().required(),
  login_attempts: Joi.number().integer().min(0).required(),
  password_last_changed: Joi.date().optional(),
  created_at: Joi.date().optional(),
  updated_at: Joi.date().optional(),
  deleted_at: Joi.date().optional(),
});

// Get all user histories
router.get('/', async (req, res, next) => {
  try {
    const userHistories = await UserHistory.findAll();
    res.json(userHistories);
  } catch (e) {
    console.error('Error fetching user histories:', e);
    next(e);
  }
});

// Get user history by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const userHistory = await UserHistory.findByPk(id);

    if (userHistory) {
      res.json(userHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching user history by ID:', e);
    next(e);
  }
});

// Create new user history
router.post('/new', async (req, res, next) => {
  try {
    const { error } = userHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userHistory = await UserHistory.create(req.body);
    res.status(201).json(userHistory);
  } catch (e) {
    console.error('Error creating user history:', e);
    next(e);
  }
});

// Update user history
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = userHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const userHistory = await UserHistory.findByPk(req.params.id);

    if (userHistory) {
      await userHistory.update(req.body);
      res.json(userHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user history:', e);
    next(e);
  }
});

// Delete user history
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await UserHistory.destroy({
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
    console.error('Error deleting user history:', e);
    next(e);
  }
});

module.exports = router;
