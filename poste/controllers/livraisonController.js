const { Livraison } = require('../models');

exports.getAllLivraison = async (req, res) => {
    try {
        const livraisons = await Livraison.findAll();
        res.json(livraisons);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Obtenir une livraison par ID
exports.getLivraisonById = async (req, res) => {
    try {
        const livraison = await Livraison.findOne({ where: { id: req.params.id}});
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        res.json(livraison);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Créer une nouvelle livraison
exports.createLivraison = async (req, res) => {
    try {
        // Validation des données requises
        const { expediteur, destinataire } = req.body;
        
        if (!expediteur || !destinataire) {
            return res.status(400).json({ 
                error: 'Données manquantes', 
                message: 'Les champs expediteur et destinataire sont requis' 
            });
        }

        // Validation de la structure des données
        if (!expediteur.nom || !expediteur.adresse || !destinataire.nom || !destinataire.adresse) {
            return res.status(400).json({ 
                error: 'Données invalides', 
                message: 'Les champs nom et adresse sont requis pour expediteur et destinataire' 
            });
        }

        const newLivraison = await Livraison.create(req.body);
        res.status(201).json(newLivraison);
    } catch (error) {
        console.error('Erreur lors de la création de la livraison:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre à jour le statut d'une livraison
exports.updateLivraisonStatus = async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!status) {
            return res.status(400).json({ 
                error: 'Données manquantes', 
                message: 'Le champ status est requis' 
            });
        }

        const livraison = await Livraison.findOne({ where: { id: req.params.id}});
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        
        livraison.status = status;
        await livraison.save();
        res.json(livraison);
    } catch (error) {
        console.error('Erreur lors de la mise à jour de la livraison:', error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
