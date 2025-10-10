const express = require('express');
const multer = require('multer');
const path = require('path');
const router = express.Router();
const productController = require('../controllers/productController');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../uploads')); 
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});


const upload = multer({
    storage: storage,
    limits: { fileSize: 1024 * 1024 * 5 },
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
router.post('/new', upload.single('image'), productController.createProduct); 
router.patch('/:id', upload.single('image'), productController.updateProduct); 
router.delete('/:id', productController.deleteProduct);

module.exports = router;
