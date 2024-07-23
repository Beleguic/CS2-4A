const { Livraison } = require('../models');

exports.getAllLivraison = async (req, res) => {
    console.log('here');
    console.log(Livraison);
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
        const livraison = await Livraison.findOne({ where: { livraison: req.params.id}});
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
    console.log('Livraison');
    try {
        console.log(req.body);
        const newLivraison = await Livraison.create(req.body);
        res.status(201).json(newLivraison);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};

// Mettre à jour le statut d'une livraison
exports.updateLivraisonStatus = async (req, res) => {
    try {
        const livraison = await Livraison.findOne({ where: { livraison: req.params.id}});
        if (!livraison) {
            return res.status(404).json({ error: 'Livraison non trouvée' });
        }
        livraison.status = req.body.status;
        await livraison.save();
        res.json(livraison);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Erreur serveur' });
    }
};
