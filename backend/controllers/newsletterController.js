const { Newsletter: NewsletterPostgres, User: UserPostgres, sequelize } = require('../models');
const NewsletterMongo = require('../mongo/models/Newsletter');
const UserMongo = require('../mongo/models/User');
const Joi = require('joi');
const mongoose = require('mongoose');

// Newsletter schema validation
const newsletterSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
});

const getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await NewsletterPostgres.findAll({
      include: [{ model: UserPostgres, as: 'user', attributes: ['id', 'username', 'email'] }]
    });
    res.json(newsletters);
  } catch (e) {
    console.error('Error fetching newsletters:', e);
    next(e);
  }
};

const getNewsletterById = async (req, res, next) => {
  try {
    const id = req.params.id;
    const newsletter = await NewsletterPostgres.findByPk(id, {
      include: [{ model: UserPostgres, as: 'user', attributes: ['id', 'username', 'email'] }]
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
};

const createNewsletter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const newsletterPostgres = await NewsletterPostgres.create(req.body, { transaction });

    const newsletterMongo = new NewsletterMongo({
      _id: newsletterPostgres.id,
      user_id: newsletterPostgres.user_id
    });
    await newsletterMongo.save({ session });

    await transaction.commit();
    await session.commitTransaction();
    res.status(201).json(newsletterPostgres);
  } catch (e) {
    console.error('Error creating newsletter:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const updateNewsletter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const { error } = newsletterSchema.validate(req.body);
    if (error) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(400).json({ error: error.details[0].message });
    }

    const newsletterPostgres = await NewsletterPostgres.findByPk(req.params.id);
    if (!newsletterPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Newsletter not found in PostgreSQL' });
    }

    await newsletterPostgres.update(req.body, { transaction });

    const newsletterMongo = await NewsletterMongo.findById(req.params.id).session(session);
    if (newsletterMongo) {
      Object.assign(newsletterMongo, req.body);
      await newsletterMongo.save({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.json(newsletterPostgres);
  } catch (e) {
    console.error('Error updating newsletter:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

const deleteNewsletter = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  const transaction = await sequelize.transaction();

  try {
    const newsletterPostgres = await NewsletterPostgres.findByPk(req.params.id);
    if (!newsletterPostgres) {
      await transaction.rollback();
      await session.abortTransaction();
      return res.status(404).json({ message: 'Newsletter not found in PostgreSQL' });
    }

    await newsletterPostgres.destroy({ transaction });

    const newsletterMongo = await NewsletterMongo.findById(req.params.id).session(session);
    if (newsletterMongo) {
      await newsletterMongo.remove({ session });
    }

    await transaction.commit();
    await session.commitTransaction();
    res.status(204).send();
  } catch (e) {
    console.error('Error deleting newsletter:', e);
    await transaction.rollback();
    await session.abortTransaction();
    next(e);
  } finally {
    session.endSession();
  }
};

module.exports = {
  getAllNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
};
