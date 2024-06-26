const express = require('express');
const Category = require('../models/category');
const router = express.Router();
const { Op } = require('sequelize');

// Filtrer les paramètres de requête pour s'assurer qu'ils sont valides
const filterQueryParams = (query) => {
    const validParams = ['name', 'description', 'is_active']; // Ajoutez ici les champs valides pour la recherche
    return Object.keys(query)
        .filter(key => validParams.includes(key))
        .reduce((obj, key) => {
            obj[key] = query[key];
            return obj;
        }, {});
};

// Toutes les catégories
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

// Catégorie spécifique
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

// Mise à jour selon l'UUID
router.patch('/:id', async (req, res, next) => {
    try {
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

// Nouvelle catégorie
router.post('/new', async (req, res, next) => {
    try {
        const { name, url } = req.body;

        // Validation basique des données d'entrée
        if (!name || !/^[a-zA-Z0-9-]+$/.test(url)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }

        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        next(e);
    }
});

// Supprimer selon l'URL
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
