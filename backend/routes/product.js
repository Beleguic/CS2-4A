const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const productController = require('../controllers/productController');

// Configuration du stockage des fichiers
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); // Répertoire où les fichiers seront stockés
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Nom unique pour chaque fichier
    }
});

// Initialisation de multer avec la configuration de stockage
const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 }, // Limite de taille de fichier à 5MB
    fileFilter: (req, file, cb) => {
        const filetypes = /jpeg|jpg|png|webp/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

        if (mimetype && extname) {
            return cb(null, true);
        } else {
            cb(new Error('Only .png, .jpg, .jpeg, .webp format allowed!'));
        }
    }
});

// Routes
router.get('/products-with-stock', productController.getAllProductsWithStock);
router.get('/list', productController.getAllProductsForSelection);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);
router.post('/new', upload.single('image'), productController.createProduct); // Ajout de l'upload pour la création de produit
router.patch('/:id', upload.single('image'), productController.updateProduct); // Ajout de l'upload pour la mise à jour de produit
router.delete('/:id', productController.deleteProduct);

module.exports = router;
