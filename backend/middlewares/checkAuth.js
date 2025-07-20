const jwt = require('jsonwebtoken');
const { User } = require('../models');

// Middleware d'authentification sécurisé
const checkAuth = async (req, res, next) => {
    try {
        // Récupération du token depuis les headers
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ 
                message: 'Token d\'authentification manquant ou invalide' 
            });
        }

        const token = authHeader.substring(7); // Supprimer "Bearer "

        // Vérification du format du token
        if (!token || token.length < 10) {
            return res.status(401).json({ 
                message: 'Format de token invalide' 
            });
        }

        // Vérification et décodage du token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret-change-in-production');
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ 
                    message: 'Token expiré. Veuillez vous reconnecter.' 
                });
            } else if (error.name === 'JsonWebTokenError') {
                return res.status(401).json({ 
                    message: 'Token invalide' 
                });
            } else {
                return res.status(401).json({ 
                    message: 'Erreur de vérification du token' 
                });
            }
        }

        // Validation des claims du token
        if (!decoded.userId || !decoded.email || !decoded.role) {
            return res.status(401).json({ 
                message: 'Token corrompu ou invalide' 
            });
        }

        // Vérification de l'utilisateur en base de données
        const user = await User.findOne({
            where: { 
                id: decoded.userId,
                email: decoded.email,
                is_verified: true
            },
            attributes: ['id', 'email', 'role', 'is_verified', 'login_attempts', 'lock_until']
        });

        if (!user) {
            return res.status(401).json({ 
                message: 'Utilisateur non trouvé ou compte non vérifié' 
            });
        }

        // Vérification du verrouillage du compte
        if (user.lock_until && user.lock_until > new Date()) {
            return res.status(401).json({ 
                message: 'Compte temporairement verrouillé' 
            });
        }

        // Vérification de la cohérence des rôles
        if (user.role !== decoded.role) {
            return res.status(401).json({ 
                message: 'Rôle utilisateur incohérent' 
            });
        }

        // Ajout des informations utilisateur à la requête
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            isVerified: user.is_verified
        };

        // Ajout du token décodé pour utilisation ultérieure
        req.token = decoded;

        next();
    } catch (error) {
        console.error('Erreur dans le middleware d\'authentification:', error);
        res.status(500).json({ 
            message: 'Erreur interne lors de l\'authentification',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

// Middleware de vérification de rôle
const checkRole = (allowedRoles) => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Authentification requise' 
                });
            }

            // Vérification si le rôle est autorisé
            if (!allowedRoles.includes(req.user.role)) {
                return res.status(403).json({ 
                    message: 'Accès refusé. Permissions insuffisantes.' 
                });
            }

            next();
        } catch (error) {
            console.error('Erreur dans la vérification de rôle:', error);
            res.status(500).json({ 
                message: 'Erreur interne lors de la vérification des permissions',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

// Middleware de vérification de propriétaire (pour les ressources utilisateur)
const checkOwnership = (resourceUserIdField = 'user_id') => {
    return (req, res, next) => {
        try {
            if (!req.user) {
                return res.status(401).json({ 
                    message: 'Authentification requise' 
                });
            }

            // Les admins peuvent accéder à toutes les ressources
            if (req.user.role === 'admin') {
                return next();
            }

            // Vérification de la propriété de la ressource
            const resourceUserId = req.params[resourceUserIdField] || req.body[resourceUserIdField];
            
            if (!resourceUserId) {
                return res.status(400).json({ 
                    message: 'ID utilisateur de la ressource manquant' 
                });
            }

            if (resourceUserId !== req.user.id) {
                return res.status(403).json({ 
                    message: 'Accès refusé. Vous ne pouvez accéder qu\'à vos propres ressources.' 
                });
            }

            next();
        } catch (error) {
            console.error('Erreur dans la vérification de propriété:', error);
            res.status(500).json({ 
                message: 'Erreur interne lors de la vérification de propriété',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

// Middleware de rate limiting spécifique pour l'authentification
const authRateLimit = (req, res, next) => {
    // Ce middleware peut être utilisé pour limiter les tentatives de connexion
    // par IP ou par utilisateur
    next();
};

// Middleware de validation des paramètres d'URL
const validateParams = (paramSchema) => {
    return (req, res, next) => {
        try {
            const { error } = paramSchema.validate(req.params);
            if (error) {
                return res.status(400).json({ 
                    message: 'Paramètres invalides',
                    details: error.details.map(detail => detail.message)
                });
            }
            next();
        } catch (error) {
            console.error('Erreur dans la validation des paramètres:', error);
            res.status(500).json({ 
                message: 'Erreur interne lors de la validation',
                error: process.env.NODE_ENV === 'development' ? error.message : undefined
            });
        }
    };
};

module.exports = {
    checkAuth,
    checkRole,
    checkOwnership,
    authRateLimit,
    validateParams
};
