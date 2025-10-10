require('dotenv').config();
const express = require("express");
const path = require('path');
const session = require('express-session');
const cookieParser = require("cookie-parser");
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
const cors = require("cors");
const nodemailer = require('nodemailer');
const app = express();

const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, 
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
    }
});


app.use((req, res, next) => {
    req.transporter = transporter;
    next();
});


app.use(session({
    secret: 'challenge4IWS2',
    resave: false,
    saveUninitialized: true,
    cookie: { secure: process.env.NODE_ENV === 'production' }
}));


app.use(cookieParser(process.env.JWT_SECRET));
app.use(express.json());
app.use(cors());


app.use('/uploads', express.static(path.join(__dirname, 'uploads')));


app.use("/users", UserRouter);
app.use("/auth", AuthRouter);
app.use("/category", CategoryRouter);
app.use('/alert', AlertRouter);
app.use('/product', ProductRouter);
app.use('/alert_types', AlertTypeRouter);
app.use('/category_product', CategoryProductRouter);
app.use('/cart', CartRouter);
app.use('/order', OrderRouter);
app.use('/newsletter', NewsletterRouter);
app.use('/stock', StockRouter);
app.use('/user_history', UserHistoryRouter);
app.use('/password_history', PasswordHistoryRouter);
app.use('/product_promotion', ProductPromotionRouter);
app.use('/promotion_code', PromotionRouter);
app.use('/stripe', StripeRooter);

// Middleware de gestion d'erreurs global
app.use((err, req, res, next) => {
    console.error('Erreur globale:', err);
    
    // Erreur de validation Joi
    if (err.isJoi) {
        return res.status(400).json({
            error: 'Erreur de validation',
            details: err.details.map(detail => detail.message)
        });
    }
    
    // Erreur de fichier Multer
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({
            error: 'Fichier trop volumineux',
            message: 'La taille du fichier ne doit pas dépasser 5MB'
        });
    }
    
    // Erreur de type de fichier Multer
    if (err.message && err.message.includes('format allowed')) {
        return res.status(400).json({
            error: 'Type de fichier non autorisé',
            message: 'Seuls les fichiers .png, .jpg, .jpeg, .webp sont autorisés'
        });
    }
    
    // Erreur Sequelize
    if (err.name === 'SequelizeValidationError') {
        return res.status(400).json({
            error: 'Erreur de validation de données',
            details: err.errors.map(e => e.message)
        });
    }
    
    if (err.name === 'SequelizeUniqueConstraintError') {
        return res.status(409).json({
            error: 'Conflit de données',
            message: 'Cette ressource existe déjà'
        });
    }
    
    // Erreur JWT
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
            error: 'Token invalide',
            message: 'Votre session a expiré, veuillez vous reconnecter'
        });
    }
    
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
            error: 'Token expiré',
            message: 'Votre session a expiré, veuillez vous reconnecter'
        });
    }
    
    // Erreur par défaut
    const statusCode = err.statusCode || 500;
    const message = process.env.NODE_ENV === 'production' 
        ? 'Une erreur interne est survenue' 
        : err.message;
    
    res.status(statusCode).json({
        error: 'Erreur interne du serveur',
        message: message,
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
});

// Middleware pour les routes non trouvées
app.use('*', (req, res) => {
    res.status(404).json({
        error: 'Route non trouvée',
        message: `La route ${req.method} ${req.originalUrl} n'existe pas`
    });
});

module.exports = app;
