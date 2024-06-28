const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const Joi = require('joi');

// Schéma de validation de la catégorie
const categorySchema = Joi.object({
  name: Joi.string().min(3).max(30).required(),
  url: Joi.string().regex(/^[a-zA-Z0-9-]+$/).required(),
  description: Joi.string().optional(),
  image: Joi.string().optional(),
  is_active: Joi.boolean().optional()
});

// Filtrer les paramètres de requête pour s'assurer qu'ils sont valides
const filterQueryParams = (query) => {
  const validParams = ['name', 'description', 'image', 'is_active'];
  return Object.keys(query)
    .filter(key => validParams.includes(key))
    .reduce((obj, key) => {
      obj[key] = query[key];
      return obj;
    }, {});
};

// Obtenir toutes les catégories
router.get('/', async (req, res, next) => {
  try {
    const isFrontend = req.query.frontend === 'true';
    const filteredQuery = filterQueryParams(req.query);
    const whereCondition = isFrontend ? { is_active: true } : {};

    const categories = await Category.findAll({
      where: {
        ...whereCondition,
        ...filteredQuery,
      },
    });
    res.json(categories);
  } catch (e) {
    next(e);
  }
});

// Obtenir une catégorie spécifique par ID ou URL
router.get('/:id', async (req, res, next) => {
  try {
    const id = req.params.id;
    const isFrontend = req.query.frontend === 'true';

    const whereCondition = isFrontend
      ? { is_active: true, url: id }
      : { id: id };

    const category = await Category.findOne({
      where: whereCondition,
    });

    if (category) {
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

router.patch('/:id', async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.findByPk(req.params.id);

    if (category) {
      await category.update(req.body);
      res.json(category);
    } else {
      res.sendStatus(404);
    }
  } catch (e) {
    next(e);
  }
});

// Créer une nouvelle catégorie
router.post('/new', async (req, res, next) => {
  try {
    const { error } = categorySchema.validate(req.body);
    if (error) {
      return res.status(400).json({ error: error.details[0].message });
    }

    const category = await Category.create(req.body);
    res.status(201).json(category);
  } catch (e) {
    next(e);
  }
});

// Supprimer une catégorie par ID
router.delete('/:id', async (req, res, next) => {
  try {
    const nbDeleted = await Category.destroy({
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
    next(e);
  }
});

module.exports = router;