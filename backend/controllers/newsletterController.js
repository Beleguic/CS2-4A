const { Newsletter, User } = require('../models');
const Joi = require('joi');

// Newsletter schema validation
const newsletterSchema = Joi.object({
  user_id: Joi.string().uuid().required(),
});

const getAllNewsletters = async (req, res, next) => {
  try {
    const newsletters = await Newsletter.findAll({
      include: [{ model: User, as: 'user', attributes: ['id', 'username', 'email'] }]
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
};

const createNewsletter = async (req, res, next) => {
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
};

const updateNewsletter = async (req, res, next) => {
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
};

const deleteNewsletter = async (req, res, next) => {
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
};

module.exports = {
  getAllNewsletters,
  getNewsletterById,
  createNewsletter,
  updateNewsletter,
  deleteNewsletter,
};
