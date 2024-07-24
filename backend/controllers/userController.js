const { User: UserPostgres, Newsletter: NewsletterPostgres } = require('../models');
const NewsletterMongo = require('../mongo/models/Newsletter');
const UserMongo = require('../mongo/models/User');
const Alert = require('../mongo/models/Alert');
const Joi = require('joi');
const { Op } = require('sequelize');
const mongoose = require('mongoose'); // Ajout de mongoose

// User schema validation
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

    const user = await UserPostgres.findByPk(req.params.id);
    const requestingUser = await UserPostgres.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot edit other admin accounts." });
      }

      if (!filteredBody.password) {
        delete filteredBody.password;
      }

      await user.update(filteredBody);

      if (filteredBody.isSubscribedToNewsletter) {
        await NewsletterPostgres.findOrCreate({ where: { user_id: user.id } });
      } else {
        await NewsletterPostgres.destroy({ where: { user_id: user.id } });
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
    const requestingUser = await UserPostgres.findByPk(req.userData.userId);
    let users;

    if (isAdmin(requestingUser)) {
      users = await UserMongo.find({
        $or: [
          { role: { $ne: 'admin' } },
          { _id: requestingUser.id }
        ]
      }).populate({
        path: 'alerts',
        populate: [
          { path: 'product_id', select: 'name' },
          { path: 'category_id', select: 'name' }
        ]
      }).populate('newsletters');
    } else {
      users = await UserMongo.find().populate({
        path: 'alerts',
        populate: [
          { path: 'product_id', select: 'name' },
          { path: 'category_id', select: 'name' }
        ]
      }).populate('newsletters');
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
    console.log(`Fetching user by ID: ${id}`);

    const user = await UserMongo.findById(id)
      .populate({
        path: 'alerts',
        populate: [
          { path: 'alert_type_id', select: 'type' },
          { path: 'product_id', select: 'name' },
          { path: 'category_id', select: 'name' }
        ]
      });

    const requestingUser = await UserPostgres.findByPk(req.userData.userId);

    if (user) {
      console.log(`User found in MongoDB: ${user}`);

      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot view other admin accounts." });
      }

      const newsletterSubscription = await NewsletterMongo.findOne({ user_id: id });
      const isSubscribedToNewsletter = !!newsletterSubscription;

      const userResponse = {
        ...filterUserResponse(user),
        alerts: user.alerts,
        isSubscribedToNewsletter
      };

      console.log('User response:', userResponse);

      res.json(userResponse);
    } else {
      console.log('User not found in MongoDB');
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

    const user = await UserPostgres.create(filteredBody);
    res.status(201).json(user);
  } catch (e) {
    console.error('Error creating user:', e);
    next(e);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const user = await UserPostgres.findByPk(req.params.id);
    const requestingUser = await UserPostgres.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        return res.status(403).json({ message: "You cannot delete other admin accounts." });
      }

      const nbDeleted = await UserPostgres.destroy({
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

const updateUserProfile = async (req, res) => {
  const userId = req.params.id;
  const { email, username, firstName, lastName, dateOfBirth, isSubscribedToNewsletter } = req.body;

  console.log(`Starting update for userId: ${userId}`);
  console.log('Request body:', req.body);

  try {
    const userPostgres = await UserPostgres.findByPk(userId);
    if (!userPostgres) {
      console.log('User not found in PostgreSQL');
      return res.status(404).json({ message: 'User not found in PostgreSQL' });
    }

    console.log('Updating user in PostgreSQL');
    await userPostgres.update({
      email,
      username,
      firstName,
      lastName,
      dateOfBirth,
      isSubscribedToNewsletter
    });

    console.log('Fetching user from MongoDB');
    const userMongo = await UserMongo.findById(userId);
    if (userMongo) {
      console.log('Updating user in MongoDB');
      userMongo.email = email;
      userMongo.username = username;
      userMongo.firstName = firstName;
      userMongo.lastName = lastName;
      userMongo.dateOfBirth = dateOfBirth;
      userMongo.isSubscribedToNewsletter = isSubscribedToNewsletter;
      await userMongo.save();

      if (isSubscribedToNewsletter) {
        console.log('Subscribing user to newsletter in MongoDB');
        let newsletter = await NewsletterMongo.findOne({ user_id: userId });
        if (!newsletter) {
          newsletter = new NewsletterMongo({ _id: new mongoose.Types.ObjectId(), user_id: userId });
        }
        await newsletter.save();
      } else {
        console.log('Unsubscribing user from newsletter in MongoDB');
        await NewsletterMongo.deleteOne({ user_id: userId });
      }
    } else {
      console.log('User not found in MongoDB');
    }

    console.log('Profile updated successfully');
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    res.status(500).json({ message: 'An error occurred while updating the profile', error: error.message });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserProfile,
};
