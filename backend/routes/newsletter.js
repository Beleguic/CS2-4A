const express = require('express');
const { Newsletter, User } = require('../models');
const router = express.Router();
const Joi = require('joi');

// Newsletter schema validation
const newsletterSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
});

// Get all newsletters
router.get('/', async (req, res, next) => {
  try {
    const newsletters = await Newsletter.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });
    res.json(newsletters);
  } catch (e) {
    console.error('Error fetching newsletters:', e);
    next(e);
  }
});

// Get newsletter by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const newsletter = await Newsletter.findByPk(id, {
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
    });

    if (newsletter) {
      res.json(newsletter);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching newsletter by ID:', e);
    next(e);
  }
});

// Create new newsletter
router.post('/new', async (req, res, next) => {
  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newsletter = await Newsletter.create(req.body);
    res.status(201).json(newsletter);
  } catch (e) {
    console.error('Error creating newsletter:', e);
    next(e);
  }
});

// Update newsletter
router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const newsletter = await Newsletter.findByPk(req.params.id);

    if (newsletter) {
      await newsletter.update(req.body);
      res.json(newsletter);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating newsletter:', e);
    next(e);
  }
});

// Delete newsletter
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Newsletter.destroy({
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
    console.error('Error deleting newsletter:', e);
    next(e);
  }
});

module.exports = router;
