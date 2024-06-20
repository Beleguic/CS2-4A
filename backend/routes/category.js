const { Router } = require('express');
const Category = require('../models/category');
const router = new Router();

// Route pour obtenir toutes les catégories
router.get('/', async (req, res, next) => {
    try {
        const categories = await Category.findAll({
            where: req.query,
        });
        res.json(categories);
    } catch (e) {
        next(e);
    }
});

// Route pour obtenir une catégorie spécifique
router.get('/:id', async (req, res, next) => {
    try {
        const category = await Category.findByPk(req.params.id);

        if (category) {
            res.json(category);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

// Route pour mettre à jour une catégorie spécifique
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

// Route pour créer une nouvelle catégorie
router.post('/', async (req, res, next) => {
    try {
        const category = await Category.create(req.body);
        res.status(201).json(category);
    } catch (e) {
        next(e);
    }
});

// Route pour supprimer une catégorie spécifique
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
