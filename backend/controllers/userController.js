const { User, Newsletter, Alert, AlertType, Product, Category } = require('../models');
const Joi = require('joi');

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

const getAllUsers = async (req, res, next) => {
  try {
    const requestingUser = await User.findByPk(req.userData.userId);
    let users;

    if (isAdmin(requestingUser)) {
      users = await User.findAll();
      return res.status(200).json(users);
    } else {
      return res.sendStatus(404);
    }

  } catch (e) {
    return res.sendStatus(404);

  }
};

const getUserById = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id, {
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
    
    if (!user) {
      return res.sendStatus(404);
    }

    const requestingUser = await User.findByPk(req.userData.userId);
    
    if (isAdmin(requestingUser) || (requestingUser.id === user.id)) {
      const userResponse = filterUserResponse(user);
      userResponse.isSubscribedToNewsletter = user.newsletters.length > 0;
      userResponse.alerts = user.alerts;

      return res.status(200).json(userResponse);
    } else {
      return res.sendStatus(404);
    }
  } catch (e) {
    return res.sendStatus(404);
  }
};

const createUser = async (req, res, next) => {
  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      return res.status(400);
    }

    const user = await User.create(filteredBody);
    return res.status(201).json(user);
  } catch (e) {
    return res.sendStatus(404);
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

    if (!user) {
      return res.sendStatus(404);
    }

    if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
      return res.status(404);
    }

    if (!filteredBody.password) {
      delete filteredBody.password;
    }

    await user.update(filteredBody);

    if (filteredBody.isSubscribedToNewsletter) {
      await Newsletter.findOrCreate({ where: { user_id: user.id } });
    } else {
      await Newsletter.destroy({ where: { user_id: user.id } });
    }

    const updatedUser = filterUserResponse(user);

    return res.status(200).json(updatedUser);
  } catch (e) {
    return res.sendStatus(404);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.params.id);
    const requestingUser = await User.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(404);
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
    return res.sendStatus(404);
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser
};
