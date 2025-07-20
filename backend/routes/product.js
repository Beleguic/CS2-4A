const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const productController = require('../controllers/productController');
const { checkAuth, checkRole } = require('../middlewares/checkAuth');

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

// Routes publiques (lecture seule)
router.get('/products-with-stock', productController.getAllProductsWithStock);
router.get('/list', productController.getAllProductsForSelection);
router.get('/', productController.getAllProducts);
router.get('/:id', productController.getProductById);

// Routes protégées (CRUD complet) - Admin uniquement
router.post('/new', checkAuth, checkRole(['admin']), upload.single('image'), productController.createProduct);
router.patch('/:id', checkAuth, checkRole(['admin']), upload.single('image'), productController.updateProduct);
router.delete('/:id', checkAuth, checkRole(['admin']), productController.deleteProduct);

module.exports = router;
