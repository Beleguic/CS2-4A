const { User, Newsletter, Alert, AlertType, Product, Category } = require('../models');
const Joi = require('joi');
const { Op } = require('sequelize');

// User schema validation (backend)
const userSchema = Joi.object({
  email: Joi.string().email().required(),
  dateOfBirth: Joi.date().required(),
  password: Joi.string().optional(),
  username: Joi.string().required(),
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  isSubscribedToNewsletter: Joi.boolean().optional()
}).options({ stripUnknown: true });

const filterUserFields = (user) => {
  const { created_at, updated_at, verification_token, reset_password_token, reset_password_expires, login_attempts, lock_until, password_last_changed, role, is_verified, ...filteredUser } = user;
  return filteredUser;
};

const filterUserResponse = (user) => {
  const { email, firstName, lastName, username, dateOfBirth, isSubscribedToNewsletter } = user;
  return { email, firstName, lastName, username, dateOfBirth, isSubscribedToNewsletter };
};

const isAdmin = (user) => user.role === 'admin';

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

      // Ne met à jour le mot de passe que s'il est fourni
      if (!filteredBody.password) {
        delete filteredBody.password;
      }

      await user.update(filteredBody);

      // Handle newsletter subscription
      if (filteredBody.isSubscribedToNewsletter) {
        await Newsletter.findOrCreate({ where: { user_id: user.id } });
      } else {
        await Newsletter.destroy({ where: { user_id: user.id } });
      }

      res.json(user);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user:', e);
    next(e);
  }
};

const getAllUsers = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);
    let users;

    if (isAdmin(requestingUser)) {
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
    const user = await User.findByPk(id, {
      include: [
        { model: Newsletter, as: 'newsletters', attributes: ['id'] },
        {
          model: Alert,
          as: 'alerts',
          include: [
            { model: AlertType, as: 'alertType', attributes: ['type'] },
            { model: Product, as: 'product', attributes: ['id', 'name'] },
            { model: Category, as: 'category', attributes: ['id', 'name'] }
          ]
        }
      ]
    });
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot view other admin accounts." });
      }

      const userResponse = filterUserResponse(user);
      userResponse.isSubscribedToNewsletter = user.newsletters.length > 0;
      userResponse.alerts = user.alerts;

      res.json(userResponse);
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
  deleteUser
};
