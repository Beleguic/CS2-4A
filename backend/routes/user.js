const express = require('express');
const router = express.Router();
const { User } = require('../models');
const checkAuth = require('../middlewares/checkAuth');
const Joi = require('joi');

// Schéma de validation pour Joi
const userSchema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    dateOfBirth: Joi.date().required(),
    role: Joi.string().valid('user', 'admin').default('user'),
    is_verified: Joi.boolean().default(false),
    verification_token: Joi.string().optional(),
    login_attempts: Joi.number().integer().min(0).default(0),
    lock_until: Joi.date().optional(),
    reset_password_token: Joi.string().optional(),
    reset_password_expires: Joi.date().optional(),
    password_last_changed: Joi.date().optional(),
    username: Joi.string().min(3).max(128).required(),
});

// Récupérer un utilisateur par ID
router.get('/:userId', checkAuth, async (req, res, next) => {
    try {
        const userId = req.params.userId;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ email: user.email, id: user.id });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user' });
    }
});

// Enregistrer un nouvel utilisateur (sécurisé)
router.post('/', async (req, res, next) => {
    try {
        const { error, value } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const user = await User.create(value);
        res.status(201).json(user);
    } catch (e) {
        next(e);
    }
});

// Rechercher un utilisateur par ID
router.get('/:id', async (req, res, next) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (user) res.json(user);
        else res.sendStatus(404);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving user' });
    }
});

// Supprimer un utilisateur
router.delete('/:id', checkAuth, async (req, res, next) => {
    try {
        const userId = req.params.id;
        const nbDeleted = await User.destroy({ where: { id: userId } });
        if (nbDeleted === 1) res.sendStatus(204);
        else res.sendStatus(404);
    } catch (error) {
        res.status(500).json({ message: 'Error deleting user' });
    }
});

// Mettre à jour ou insérer un utilisateur (upsert)
router.put('/:id', checkAuth, async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { error, value } = userSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const [nbUpdated, users] = await User.upsert({ id: userId, ...value }, { returning: true });
        res.status(nbUpdated ? 200 : 201).json(users[0]);
    } catch (e) {
        next(e);
    }
});

// Partiellement mettre à jour un utilisateur (patch)
router.patch('/:id', checkAuth, async (req, res, next) => {
    try {
        const userId = req.params.id;
        const { error, value } = userSchema.validate(req.body, { allowUnknown: true, noDefaults: true });
        if (error) {
            return res.status(400).json({ message: error.details[0].message });
        }
        const [nbUpdated, users] = await User.update(value, {
            where: { id: userId },
            returning: true,
            individualHooks: true,
        });
        if (nbUpdated === 1) {
            res.json(users[0]);
        } else {
            res.sendStatus(404);
        }
    } catch (e) {
        next(e);
    }
});

module.exports = router;
