require('dotenv').config({ path: '../.env' });
const express = require("express");
const session = require('express-session');
const cookieParser = require("cookie-parser");
const cors = require("cors");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const app = express();
const LivraisonRouter = require("./routes/livraison");

// Configuration de sécurité avec Helmet
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true
    }
}));

// Rate limiting pour prévenir les attaques par déni de service
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par fenêtre
    message: {
        error: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

app.use(limiter);

// Configuration CORS sécurisée
const corsOptions = {
    origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : ['http://localhost:8000'],
    credentials: true,
    optionsSuccessStatus: 200,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// Configuration de la session sécurisée
app.use(session({
    secret: process.env.SESSION_SECRET || 'your-super-secret-session-key-change-in-production',
    resave: false,
    saveUninitialized: false,
    cookie: { 
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000, // 24 heures
        sameSite: 'strict'
    },
    name: 'poste-session' // Changer le nom par défaut du cookie
}));

// Middleware pour parser les cookies de manière sécurisée
app.use(cookieParser(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'));

// Middleware pour parser le JSON avec limite de taille
app.use(express.json({ 
    limit: '10mb', // Limite la taille des requêtes JSON
    verify: (req, res, buf) => {
        try {
            JSON.parse(buf);
        } catch (e) {
            res.status(400).json({ error: 'JSON invalide' });
            throw new Error('JSON invalide');
        }
    }
}));

// Middleware pour parser les données URL-encoded
app.use(express.urlencoded({ 
    extended: true, 
    limit: '10mb' 
}));

// Middleware de logging sécurisé
app.use((req, res, next) => {
    const start = Date.now();
    res.on('finish', () => {
        const duration = Date.now() - start;
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
    });
    next();
});

// Middleware pour nettoyer les en-têtes sensibles
app.use((req, res, next) => {
    res.removeHeader('X-Powered-By');
    next();
});

// Route de santé pour les health checks
app.get('/health', (req, res) => {
    res.status(200).json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'Poste API'
    });
});

// Route racine sécurisée
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenue sur Troupicool Delivery API',
        version: '1.0.0',
        documentation: '/api/docs'
    });
});

// Utilisation du router pour les livraisons avec préfixe API
app.use("/api/livraison", LivraisonRouter);

// Middleware de gestion d'erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.originalUrl
    });
});

// Middleware de gestion d'erreurs global
app.use((error, req, res, next) => {
    console.error('Erreur serveur:', error);
    
    // Ne pas exposer les détails d'erreur en production
    const isProduction = process.env.NODE_ENV === 'production';
    
    res.status(error.status || 500).json({
        error: isProduction ? 'Erreur interne du serveur' : error.message,
        ...(isProduction ? {} : { stack: error.stack })
    });
});

// Gestion gracieuse de l'arrêt
process.on('SIGTERM', () => {
    console.log('SIGTERM reçu, arrêt gracieux du serveur...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT reçu, arrêt gracieux du serveur...');
    process.exit(0);
});

// Démarrage du serveur
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Poste API Server running on port ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});
