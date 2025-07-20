const { CookieConsent, User } = require('../models');
const Joi = require('joi');
const { v4: uuidv4 } = require('uuid');

// Schéma de validation pour le consentement cookies
const cookieConsentSchema = Joi.object({
  essential: Joi.boolean().required(),
  analytics: Joi.boolean().required(),
  marketing: Joi.boolean().required()
});

// Sauvegarder le consentement cookies
const saveConsent = async (req, res, next) => {
  try {
    // Validation des données
    const { error } = cookieConsentSchema.validate(req.body);
    if (error) {
      return res.status(400).json({ 
        error: 'Données de consentement invalides',
        details: error.details[0].message 
      });
    }

    const { essential, analytics, marketing } = req.body;
    
    // Récupérer les informations de la requête
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.get('User-Agent');
    const sessionId = req.sessionID || uuidv4();
    
    // Déterminer l'utilisateur (connecté ou non)
    const userId = req.userData?.userId || null;

    // Vérifier si un consentement existe déjà pour cette session/utilisateur
    const existingConsent = await CookieConsent.findOne({
      where: userId ? { user_id: userId } : { session_id: sessionId }
    });

    let consent;

    if (existingConsent) {
      // Mettre à jour le consentement existant
      consent = await existingConsent.update({
        essential,
        analytics,
        marketing,
        ip_address: ipAddress,
        user_agent: userAgent,
        updated_at: new Date()
      });
    } else {
      // Créer un nouveau consentement
      consent = await CookieConsent.create({
        user_id: userId,
        session_id: sessionId,
        essential,
        analytics,
        marketing,
        ip_address: ipAddress,
        user_agent: userAgent
      });
    }

    // Log de l'action pour audit
    console.log(`Consentement cookies ${existingConsent ? 'mis à jour' : 'créé'}`, {
      userId: userId || 'anonymous',
      sessionId,
      essential,
      analytics,
      marketing,
      ipAddress,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Consentement cookies sauvegardé avec succès',
      consent: {
        id: consent.id,
        essential: consent.essential,
        analytics: consent.analytics,
        marketing: consent.marketing,
        created_at: consent.created_at,
        updated_at: consent.updated_at
      }
    });

  } catch (e) {
    console.error('Erreur lors de la sauvegarde du consentement cookies:', e);
    next(e);
  }
};

// Récupérer le consentement actuel
const getConsent = async (req, res, next) => {
  try {
    const userId = req.userData?.userId || null;
    const sessionId = req.sessionID;

    let consent;

    if (userId) {
      // Utilisateur connecté
      consent = await CookieConsent.findOne({
        where: { user_id: userId },
        order: [['updated_at', 'DESC']]
      });
    } else if (sessionId) {
      // Utilisateur non connecté
      consent = await CookieConsent.findOne({
        where: { session_id: sessionId },
        order: [['updated_at', 'DESC']]
      });
    }

    if (!consent) {
      return res.json({
        hasConsent: false,
        preferences: {
          essential: true,
          analytics: false,
          marketing: false
        }
      });
    }

    res.json({
      hasConsent: true,
      preferences: {
        essential: consent.essential,
        analytics: consent.analytics,
        marketing: consent.marketing
      },
      lastUpdated: consent.updated_at
    });

  } catch (e) {
    console.error('Erreur lors de la récupération du consentement cookies:', e);
    next(e);
  }
};

// Supprimer le consentement (droit à l'oubli)
const deleteConsent = async (req, res, next) => {
  try {
    const userId = req.userData?.userId || null;
    const sessionId = req.sessionID;

    if (!userId && !sessionId) {
      return res.status(400).json({ 
        error: 'Impossible d\'identifier l\'utilisateur' 
      });
    }

    const whereClause = userId ? { user_id: userId } : { session_id: sessionId };
    
    const deletedCount = await CookieConsent.destroy({
      where: whereClause
    });

    if (deletedCount === 0) {
      return res.status(404).json({ 
        error: 'Aucun consentement trouvé' 
      });
    }

    // Log de l'action pour audit
    console.log(`Consentement cookies supprimé`, {
      userId: userId || 'anonymous',
      sessionId,
      timestamp: new Date().toISOString()
    });

    res.json({
      success: true,
      message: 'Consentement cookies supprimé avec succès'
    });

  } catch (e) {
    console.error('Erreur lors de la suppression du consentement cookies:', e);
    next(e);
  }
};

// Statistiques des consentements (admin seulement)
const getConsentStats = async (req, res, next) => {
  try {
    // Vérifier que l'utilisateur est admin
    if (!req.userData || req.userData.role !== 'admin') {
      return res.status(403).json({ 
        error: 'Accès non autorisé' 
      });
    }

    const stats = await CookieConsent.findAll({
      attributes: [
        'essential',
        'analytics', 
        'marketing',
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      group: ['essential', 'analytics', 'marketing'],
      raw: true
    });

    const totalConsents = await CookieConsent.count();
    const recentConsents = await CookieConsent.count({
      where: {
        created_at: {
          [sequelize.Op.gte]: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) // 30 jours
        }
      }
    });

    res.json({
      stats,
      totalConsents,
      recentConsents,
      generatedAt: new Date().toISOString()
    });

  } catch (e) {
    console.error('Erreur lors de la récupération des statistiques:', e);
    next(e);
  }
};

module.exports = {
  saveConsent,
  getConsent,
  deleteConsent,
  getConsentStats
}; 