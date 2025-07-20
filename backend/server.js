require('dotenv').config({ path: '../.env' });
const express = require("express");
const path = require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const denormalizationService = require('./services/denormalizationService');
const UserRouter = require("./routes/user");
const AuthRouter = require("./routes/auth");
const AlertRouter = require('./routes/alert');
const CategoryRouter = require("./routes/category");
const ProductRouter = require("./routes/product");
const AlertTypeRouter = require('./routes/alertType');
const CategoryProductRouter = require('./routes/categoryProduct');
const CartRouter = require('./routes/cart');
const OrderRouter = require('./routes/order');
const NewsletterRouter = require('./routes/newsletter');
const StockRouter = require('./routes/stock');
const UserHistoryRouter = require('./routes/userHistory');
const PasswordHistoryRouter = require('./routes/passwordHistory');
const ProductPromotionRouter = require('./routes/productPromotion');
const PromotionRouter = require('./routes/promotionCode');
const StripeRooter = require('./routes/stripe');
const CookieConsentRouter = require('./routes/cookieConsent');
const ExportRouter = require('./routes/export');
const PrivacyRouter = require('./routes/privacy');
const AuditRouter = require('./routes/audit');
const cors = require("cors");
const nodemailer = require('nodemailer');
const app = express();

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
    max: 200, // limite chaque IP à 200 requêtes par fenêtre (plus élevé pour l'API principale)
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
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
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
    name: 'tropicool-session' // Changer le nom par défaut du cookie
}));

// Configuration du transporteur email sécurisé
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true', // Utiliser SSL/TLS si configuré
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    },
    // Configuration de sécurité supplémentaire
    tls: {
        rejectUnauthorized: process.env.NODE_ENV === 'production'
    }
});

// Middleware pour ajouter le transporteur à la requête
app.use((req, res, next) => {
    req.transporter = transporter;
    next();
});

// Middleware pour parser les cookies de manière sécurisée
app.use(cookieParser(process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production'));

// Configuration spéciale pour les webhooks Stripe (doit être en raw body)
app.use('/stripe/webhook', express.raw({ type: 'application/json' }));

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
        service: 'Tropicool API',
        version: '1.0.0'
    });
});

// Route racine sécurisée
app.get('/', (req, res) => {
    res.json({ 
        message: 'Bienvenue sur Tropicool API',
        version: '1.0.0',
        documentation: '/api/docs',
        endpoints: {
            auth: '/auth',
            users: '/users',
            products: '/product',
            cart: '/cart',
            orders: '/order',
            stripe: '/stripe'
        }
    });
});

// Middleware pour servir les fichiers statiques de manière sécurisée
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
    setHeaders: (res, path) => {
        // Désactiver le cache pour les fichiers sensibles
        if (path.includes('private')) {
            res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
        }
    }
}));

// Routes API avec préfixe pour une meilleure organisation
app.use("/api/users", UserRouter);
app.use("/api/auth", AuthRouter);
app.use("/api/category", CategoryRouter);
app.use('/api/alert', AlertRouter);
app.use('/api/product', ProductRouter);
app.use('/api/alert_types', AlertTypeRouter);
app.use('/api/category_product', CategoryProductRouter);
app.use('/api/cart', CartRouter);
app.use('/api/order', OrderRouter);
app.use('/api/newsletter', NewsletterRouter);
app.use('/api/stock', StockRouter);
app.use('/api/user_history', UserHistoryRouter);
app.use('/api/password_history', PasswordHistoryRouter);
app.use('/api/product_promotion', ProductPromotionRouter);
app.use('/api/promotion_code', PromotionRouter);
app.use('/api/stripe', StripeRooter);
app.use('/api/cookieConsent', CookieConsentRouter);
app.use('/api/exports', ExportRouter);
app.use('/api/privacy', PrivacyRouter);
app.use('/api/audit', AuditRouter);

// Middleware de gestion d'erreurs 404
app.use('*', (req, res) => {
    res.status(404).json({ 
        error: 'Route non trouvée',
        path: req.originalUrl,
        method: req.method
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
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
  console.log(`Tropicool API Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`CORS Origins: ${process.env.ALLOWED_ORIGINS || 'http://localhost:8000'}`);
  
  // Initialiser le service de dénormalisation
  try {
    await denormalizationService.initialize();
    console.log('✅ Service de dénormalisation initialisé avec succès');
  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation du service de dénormalisation:', error);
  }
});
