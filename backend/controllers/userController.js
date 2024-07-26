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
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const user = await UserPostgres.findByPk(req.params.id);
    const requestingUser = await UserPostgres.findByPk(req.userData.userId);

    if (user) {
      if (isAdmin(requestingUser) && isAdmin(user) && user.id !== requestingUser.id) {
        await transaction.rollback();
        await session.abortTransaction();
        return res.status(403).json({ message: "You cannot edit other admin accounts." });
      }

      if (!filteredBody.password) {
        delete filteredBody.password;
      }

      await user.update(filteredBody, { transaction });

      if (filteredBody.isSubscribedToNewsletter) {
        await NewsletterPostgres.findOrCreate({ where: { user_id: user.id }, transaction });
      } else {
        await NewsletterPostgres.destroy({ where: { user_id: user.id }, transaction });
      }

      // Mise à jour dans MongoDB
      const userMongo = await UserMongo.findById(req.params.id).session(session);
      if (userMongo) {
        Object.assign(userMongo, filteredBody);
        await userMongo.save({ session });

        if (filteredBody.isSubscribedToNewsletter) {
          let newsletter = await NewsletterMongo.findOne({ user_id: req.params.id }).session(session);
          if (!newsletter) {
            newsletter = new NewsletterMongo({ _id: new mongoose.Types.ObjectId(), user_id: req.params.id });
          }
          await newsletter.save({ session });
        } else {
          await NewsletterMongo.deleteOne({ user_id: req.params.id }).session(session);
        }
      }

      await transaction.commit();
      await session.commitTransaction();
      res.json(user);
    } else {
      await transaction.rollback();
      await session.abortTransaction();
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error updating user:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
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
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const filteredBody = filterUserFields(req.body);
    const { error } = userSchema.validate(filteredBody);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const newUserPostgres = await UserPostgres.create(filteredBody, { transaction });

    const newUserMongo = new UserMongo({
      _id: newUserPostgres.id,
      ...filteredBody,
    });
    await newUserMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    res.status(201).json(newUserPostgres);
  } catch (e) {
    console.error('Error creating user:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteUser = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await pgClient.query('BEGIN');

  try {
    const userPostgres = await UserPostgres.findByPk(req.params.id);
    const requestingUser = await UserPostgres.findByPk(req.userData.userId);

    if (userPostgres) {
      if (isAdmin(requestingUser) && isAdmin(userPostgres) && userPostgres.id !== requestingUser.id) {
        await session.abortTransaction();
        await pgClient.query('ROLLBACK');
        return res.status(403).json({ message: "You cannot delete other admin accounts." });
      }

      const nbDeleted = await UserPostgres.destroy({
        where: {
          id: req.params.id,
        },
        transaction
      });

      if (nbDeleted === 1) {
        await UserMongo.deleteOne({ _id: req.params.id }).session(session);
        await session.commitTransaction();
        await pgClient.query('COMMIT');
        res.sendStatus(204);
      } else {
        await session.abortTransaction();
        await pgClient.query('ROLLBACK');
        res.sendStatus(404);
      }
    } else {
      await session.abortTransaction();
      await pgClient.query('ROLLBACK');
      res.sendStatus(404);
    }
  } catch (e) {
    console.error('Error deleting user:', e);
    await session.abortTransaction();
    await pgClient.query('ROLLBACK');
    next(e);
  } finally {
    session.endSession();
  }
};

const updateUserProfile = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  const userId = req.params.id;
  const { email, username, firstName, lastName, dateOfBirth, isSubscribedToNewsletter } = req.body;

  try {
    const userPostgres = await UserPostgres.findByPk(userId);
    if (!userPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'User not found in PostgreSQL' });
    }

    await userPostgres.update({
      email,
      username,
      firstName,
      lastName,
      dateOfBirth,
      isSubscribedToNewsletter
    }, { transaction });

    const userMongo = await UserMongo.findById(userId).session(session);
    if (userMongo) {
      userMongo.email = email;
      userMongo.username = username;
      userMongo.firstName = firstName;
      userMongo.lastName = lastName;
      userMongo.dateOfBirth = dateOfBirth;
      userMongo.isSubscribedToNewsletter = isSubscribedToNewsletter;
      await userMongo.save({ session });

      if (isSubscribedToNewsletter) {
        let newsletter = await NewsletterMongo.findOne({ user_id: userId }).session(session);
        if (!newsletter) {
          newsletter = new NewsletterMongo({ _id: new mongoose.Types.ObjectId(), user_id: userId });
        }
        await newsletter.save({ session });
      } else {
        await NewsletterMongo.deleteOne({ user_id: userId }).session(session);
      }
    }

    await transaction.commit();
    await session.commitTransaction();
    res.json({ message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Error updating profile:', error);
    await transaction.rollback();
    await session.abortTransaction();
    res.status(500).json({ message: 'An error occurred while updating the profile', error: error.message });
  } finally {
    session.endSession();
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
