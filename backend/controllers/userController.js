const { User } = require('../models');
const { Op } = require('sequelize');
const Joi = require('joi');

// User schema validation (backend)
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().optional(),
  role: Joi.string().optional(),
  is_verified: Joi.boolean().optional(),
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  alertPreferences: Joi.array().items(Joi.string()).optional()
}).options({ stripUnknown: true }); // This will strip out any unknown fields

// Filter out fields that should not be updated by users
const filterUserFields = (user) => {
  const { created_at, updated_at, verification_token, reset_password_token, reset_password_expires, login_attempts, lock_until, password_last_changed, ...filteredUser } = user;
  return filteredUser;
};

const filterUserResponse = (user) => {
  const { email, firstName, lastName, username, dateOfBirth, alertPreferences } = user;
  return { email, firstName, lastName, username, dateOfBirth, alertPreferences };
};

const isAdmin = (user) => user.role === 'admin';

const getAllUsers = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);
    let users;

    if (isAdmin(requestingUser)) {
      // Admins can see all users except other admins (excluding themselves)
      users = await User.findAll({
        where: {
          [Op.or]: [
            { role: { [Op.ne]: 'admin' } },
            { id: requestingUser.id }
          ]
        }
      });
    } else {
      users = await User.findAll();
    }

    res.json(users);
  } catch (e) {
    console.error('Error fetching users:', e);
    next(e);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const user = await User.findByPk(id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot view other admin accounts." });
      }

      res.json(filterUserResponse(user));
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error fetching user by ID:', e);
    next(e);
  }
};

const createUser = async (req, res, next) => {
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
};

const updateUser = async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await User.findByPk(req.params.id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot edit other admin accounts." });
      }

      await user.update(filteredBody);
      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user:', e);
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot delete other admin accounts." });
      }

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
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting user:', e);
    next(e);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
};
