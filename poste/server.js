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

// Middlewares standards pour le parsing des cookies et des JSON bodies
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());  // Assurez-vous que ce middleware est présent
app.use(cors());

// Utilisation du router pour les utilisateurs
app.use("/", LivraisonRouter);

// Démarrage du serveur
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
