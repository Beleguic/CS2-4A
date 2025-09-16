require('dotenv').config();
const express = require("express");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const app = express();
const LivraisonRouter = require("./routes/livraison");


// Configuration de la session
app.use(session({
    secret: 'challenge4IWS2-LaPoste',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

app.get('/', (req, res) => {
    res.send('Bienvenue sur Troupicool Delivery!');
});

// Middlewares standards pour le parsing des cookies et des JSON bodies
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());  // Assurez-vous que ce middleware est présent
app.use(cors());

// Utilisation du router pour les livraisons
app.use("/api/livraisons", LivraisonRouter);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    res.status(500).json({ 
        error: 'Erreur interne du serveur',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Une erreur est survenue'
    });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({ error: 'Route non trouvée' });
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
