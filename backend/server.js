require('dotenv').config();
const express = require("express");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const UserRouter = require("./routes/user");
const AuthRouter = require("./routes/auth");
const CategoryRouter = require("./routes/category");
const cors = require("cors");
const nodemailer = require('nodemailer');
const app = express();

// Configuration de Nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false,  // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});

// Middleware pour rendre le transporter disponible dans les requêtes
app.use((req, res, next) => {
    req.transporter = transporter;
    next();
});

// Configuration de la session
app.use(session({
    secret: 'challenge4IWS2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));

// Middlewares standards pour le parsing des cookies et des JSON bodies
app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(cors());

// Utilisation du router pour les utilisateurs
app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/category", CategoryRouter);

// Démarrage du serveur
app.listen(process.env.PORT, () => {
    console.log("Server running on port " + process.env.PORT);
});
