const express = require('express');
const { PasswordHistory, User } = require('../models');
const router = express.Router();
const Joi = require('joi');

// PasswordHistory schema validation
const passwordHistorySchema = Joi.object({
  user_id: Joi.string().uuid().required(),
  hashed_password: Joi.string().required(),
});

// Get all password histories
router.get('/', async (req, res, next) => {
  try {
    const passwordHistories = await PasswordHistory.findAll({
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });
    res.json(passwordHistories);
  } catch (e) {
    console.error('Error fetching password histories:', e);
    next(e);
  }
});

// Get password history by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const passwordHistory = await PasswordHistory.findByPk(id, {
      include: [{ model: User, attributes: ['id', 'name', 'email'] }]
    });

    if (passwordHistory) {
      res.json(passwordHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching password history by ID:', e);
    next(e);
  }
});

// Create new password history
router.post('/new', async (req, res, next) => {
  try {
    const { error } = passwordHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const passwordHistory = await PasswordHistory.create(req.body);
    res.status(201).json(passwordHistory);
  } catch (e) {
    console.error('Error creating password history:', e);
    next(e);
  }
});

// Update password history
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = passwordHistorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const passwordHistory = await PasswordHistory.findByPk(req.params.id);

    if (passwordHistory) {
      await passwordHistory.update(req.body);
      res.json(passwordHistory);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating password history:', e);
    next(e);
  }
});

// Delete password history
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await PasswordHistory.destroy({
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
    console.error('Error deleting password history:', e);
    next(e);
  }
});

module.exports = router;
