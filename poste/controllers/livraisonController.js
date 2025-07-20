const { Livraison } = require('../models');
const Joi = require('joi');

// Schémas de validation
const livraisonSchema = Joi.object({
    expediteur: Joi.object({
        nom_entreprise: Joi.string().min(1).max(100).required(),
        adresse: Joi.string().min(1).max(200).required(),
        code_postal: Joi.string().pattern(/^\d{5}$/).required(),
        ville: Joi.string().min(1).max(100).required(),
        pays: Joi.string().min(1).max(50).required()
    }).required(),
    destinataire: Joi.object({
        nom: Joi.string().min(1).max(100).required(),
        prenom: Joi.string().min(1).max(100).required(),
        societe: Joi.string().max(100).optional(),
        adresse: Joi.string().min(1).max(200).required(),
        adresse2: Joi.string().max(200).optional(),
        ville: Joi.string().min(1).max(100).required(),
        code_postale: Joi.string().pattern(/^\d{5}$/).required(),
        telephone: Joi.string().pattern(/^(\+33|0)[1-9](\d{8})$/).required()
    }).required()
});

const statusSchema = Joi.object({
    status: Joi.string().valid('En attente', 'En cours', 'Livré', 'Annulé', 'Retourné').required()
});

// Middleware de validation
const validateLivraison = (req, res, next) => {
    const { error } = livraisonSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Données de livraison invalides',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

const validateStatus = (req, res, next) => {
    const { error } = statusSchema.validate(req.body);
    if (error) {
        return res.status(400).json({ 
            error: 'Statut invalide',
            details: error.details.map(detail => detail.message)
        });
    }
    next();
};

// Obtenir toutes les livraisons avec pagination et filtres
exports.getAllLivraison = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Limite max de 100
        const offset = (page - 1) * limit;
        
        const status = req.query.status;
        const search = req.query.search;
        
        // Construire les conditions de recherche
        const whereClause = {};
        if (status) {
            whereClause.status = status;
        }
        if (search) {
            whereClause.livraison = {
                [require('sequelize').Op.iLike]: `%${search}%`
            };
        }
        
        const { count, rows: livraisons } = await Livraison.findAndCountAll({
            where: whereClause,
            limit,
            offset,
            order: [['created_at', 'DESC']],
            attributes: ['id', 'livraison', 'expediteur', 'destinataire', 'status', 'created_at']
        });
        
        res.json({
            livraisons,
            pagination: {
                page,
                limit,
                total: count,
                pages: Math.ceil(count / limit)
            }
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des livraisons:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Obtenir une livraison par ID avec validation
exports.getLivraisonById = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID de livraison invalide' });
        }
        
        const livraison = await Livraison.findOne({ 
            where: { livraison: id },
            attributes: ['id', 'livraison', 'expediteur', 'destinataire', 'status', 'created_at']
        });
        
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        
        res.json(livraison);
    } catch (error) {
        console.error('Erreur lors de la récupération de la livraison:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Créer une nouvelle livraison avec validation
exports.createLivraison = async (req, res) => {
    try {
        // Validation des données
        const { error } = livraisonSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Données de livraison invalides',
                details: error.details.map(detail => detail.message)
            });
        }
        
        // Nettoyer et valider les données
        const livraisonData = {
            expediteur: {
                nom_entreprise: req.body.expediteur.nom_entreprise.trim(),
                adresse: req.body.expediteur.adresse.trim(),
                code_postal: req.body.expediteur.code_postal.trim(),
                ville: req.body.expediteur.ville.trim(),
                pays: req.body.expediteur.pays.trim()
            },
            destinataire: {
                nom: req.body.destinataire.nom.trim(),
                prenom: req.body.destinataire.prenom.trim(),
                societe: req.body.destinataire.societe?.trim() || null,
                adresse: req.body.destinataire.adresse.trim(),
                adresse2: req.body.destinataire.adresse2?.trim() || null,
                ville: req.body.destinataire.ville.trim(),
                code_postale: req.body.destinataire.code_postale.trim(),
                telephone: req.body.destinataire.telephone.trim()
            }
        };
        
        const newLivraison = await Livraison.create(livraisonData);
        
        // Retourner seulement les données nécessaires
        const responseData = {
            id: newLivraison.id,
            livraison: newLivraison.livraison,
            expediteur: newLivraison.expediteur,
            destinataire: newLivraison.destinataire,
            status: newLivraison.status,
            created_at: newLivraison.created_at
        };
        
        res.status(201).json(responseData);
    } catch (error) {
        console.error('Erreur lors de la création de la livraison:', error);
        
        // Gestion des erreurs spécifiques
        if (error.name === 'SequelizeValidationError') {
            return res.status(400).json({ 
                error: 'Données de livraison invalides',
                details: error.errors.map(err => err.message)
            });
        }
        
        if (error.name === 'SequelizeUniqueConstraintError') {
            return res.status(409).json({ 
                error: 'Une livraison avec ce numéro existe déjà' 
            });
        }
        
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Mettre à jour le statut d'une livraison avec validation
exports.updateLivraisonStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        
        // Validation de l'ID
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID de livraison invalide' });
        }
        
        // Validation du statut
        const { error } = statusSchema.validate(req.body);
        if (error) {
            return res.status(400).json({ 
                error: 'Statut invalide',
                details: error.details.map(detail => detail.message)
            });
        }
        
        const livraison = await Livraison.findOne({ 
            where: { livraison: id },
            attributes: ['id', 'livraison', 'expediteur', 'destinataire', 'status', 'created_at']
        });
        
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        
        // Vérifier les transitions de statut autorisées
        const allowedTransitions = {
            'En attente': ['En cours', 'Annulé'],
            'En cours': ['Livré', 'Retourné'],
            'Livré': ['Retourné'],
            'Annulé': [],
            'Retourné': []
        };
        
        const currentStatus = livraison.status;
        const allowedNextStatuses = allowedTransitions[currentStatus] || [];
        
        if (!allowedNextStatuses.includes(status)) {
            return res.status(400).json({ 
                error: `Transition de statut non autorisée de '${currentStatus}' vers '${status}'`,
                allowedTransitions: allowedNextStatuses
            });
        }
        
        livraison.status = status;
        await livraison.save();
        
        res.json({
            id: livraison.id,
            livraison: livraison.livraison,
            status: livraison.status,
            updated_at: new Date()
        });
    } catch (error) {
        console.error('Erreur lors de la mise à jour du statut:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Supprimer une livraison (soft delete)
exports.deleteLivraison = async (req, res) => {
    try {
        const { id } = req.params;
        
        // Validation de l'ID
        if (!id || typeof id !== 'string') {
            return res.status(400).json({ error: 'ID de livraison invalide' });
        }
        
        const livraison = await Livraison.findOne({ 
            where: { livraison: id },
            attributes: ['id', 'livraison', 'status']
        });
        
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        
        // Vérifier si la livraison peut être supprimée
        if (livraison.status === 'Livré' || livraison.status === 'En cours') {
            return res.status(400).json({ 
                error: 'Impossible de supprimer une livraison en cours ou livrée' 
            });
        }
        
        await livraison.destroy();
        
        res.json({ 
            message: 'Livraison supprimée avec succès',
            livraison_id: livraison.livraison
        });
    } catch (error) {
        console.error('Erreur lors de la suppression de la livraison:', error);
        res.status(500).json({ 
            error: 'Erreur interne du serveur',
            message: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Exporter les middlewares de validation
exports.validateLivraison = validateLivraison;
exports.validateStatus = validateStatus;
