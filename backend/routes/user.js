const express = require('express');
const { User } = require('../models');
const router = express.Router();
const Joi = require('joi');

// User schema validation (backend)
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().required(),
  role: Joi.string().required(),
  is_verified: Joi.boolean().required(),
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
}).options({ stripUnknown: true }); // This will strip out any unknown fields

// Filter out fields that should not be updated by users
const filterUserFields = (user) => {
  const { created_at, updated_at, verification_token, reset_password_token, reset_password_expires, login_attempts, lock_until, password_last_changed, ...filteredUser } = user;
  return filteredUser;
};

// Get all users
router.get('/', async (req, res, next) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (e) {
    console.error('Error fetching users:', e);
    next(e);
  }
});

// Get user by ID
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);

    if (user) {
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching user by ID:', e);
    next(e);
  }
});

// Create new user
router.post('/new', async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.create(filteredBody);
    res.status(201).json(user);
  } catch (e) {
    console.error('Error creating user:', e);
    next(e);
  }
});

// Update user
router.patch('/:id', async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findByPk(req.params.id);

    if (user) {
      await user.update(filteredBody);
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user:', e);
    next(e);
  }
});

// Delete user
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await User.destroy({
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
    console.error('Error deleting user:', e);
    next(e);
  }
});

module.exports = router;
