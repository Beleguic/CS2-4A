const request = require('supertest');
const express = require('express');
const multer = require('multer');
const path = require('path');
const productController = require('../controllers/productController');
const { Product, Stock } = require('../models');

const app = express();
app.use(express.json());

// Configuration du stockage des fichiers pour les tests
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get('/products-with-stock', productController.getAllProductsWithStock);
app.get('/list', productController.getAllProductsForSelection);
app.get('/', productController.getAllProducts);
app.get('/:id', productController.getProductById);
app.post('/new', upload.single('image'), productController.createProduct);
app.patch('/:id', upload.single('image'), productController.updateProduct);
app.delete('/:id', productController.deleteProduct);

jest.mock('../models', () => ({
  Product: {
    findAll: jest.fn(),
    findAndCountAll: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    destroy: jest.fn()
  },
  Stock: {
    findAll: jest.fn()
  }
}));

describe('Product Controller', () => {
  describe('GET /products-with-stock', () => {
    it('should return products with stock', async () => {
      const mockProducts = [
        {
          id: '1',
          name: 'Product 1',
          stocks: [{ quantity: 10 }, { quantity: 5 }]
        }
      ];
      Product.findAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/products-with-stock');

      expect(response.status).toBe(200);
      expect(response.body).toEqual([
        { id: '1', name: 'Product 1', stock: 15 }
      ]);
    });

    it('should handle errors', async () => {
      Product.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/products-with-stock');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /list', () => {
    it('should return all products for selection', async () => {
      const mockProducts = [
        { id: '1', name: 'Product 1' },
        { id: '2', name: 'Product 2' }
      ];
      Product.findAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/list');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProducts);
    });

    it('should handle errors', async () => {
      Product.findAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/list');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /', () => {
    it('should return paginated products', async () => {
      const mockProducts = {
        count: 2,
        rows: [
          { id: '1', name: 'Product 1', price: 10 },
          { id: '2', name: 'Product 2', price: 20 }
        ]
      };
      Product.findAndCountAll.mockResolvedValue(mockProducts);

      const response = await request(app).get('/?page=1&limit=2');

      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        totalItems: 2,
        totalPages: 1,
        currentPage: 1,
        products: mockProducts.rows
      });
    });

    it('should handle errors', async () => {
      Product.findAndCountAll.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/');

      expect(response.status).toBe(500);
    });
  });

  describe('GET /:id', () => {
    it('should return a product by ID', async () => {
      const mockProduct = { id: '1', name: 'Product 1' };
      Product.findOne.mockResolvedValue(mockProduct);

      const response = await request(app).get('/1');

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      Product.findOne.mockResolvedValue(null);

      const response = await request(app).get('/1');

      expect(response.status).toBe(404);
    });

    it('should handle errors', async () => {
      Product.findOne.mockRejectedValue(new Error('Database error'));

      const response = await request(app).get('/1');

      expect(response.status).toBe(500);
    });
  });

  describe('POST /new', () => {
    it('should create a new product', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 10 };
      Product.create.mockResolvedValue(mockProduct);

      const response = await request(app)
        .post('/new')
        .send({ name: 'Product 1', price: 10, description: 'Description', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(201);
      expect(response.body).toEqual(mockProduct);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .post('/new')
        .send({ name: 'P1', price: -10, description: 'Desc', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle errors', async () => {
      Product.create.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .post('/new')
        .send({ name: 'Product 1', price: 10, description: 'Description', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(500);
    });
  });

  describe('PATCH /:id', () => {
    it('should update a product', async () => {
      const mockProduct = { id: '1', name: 'Product 1', price: 10 };
      Product.findByPk.mockResolvedValue(mockProduct);
      mockProduct.update = jest.fn().mockResolvedValue(mockProduct);

      const response = await request(app)
        .patch('/1')
        .send({ name: 'Updated Product 1', price: 15, description: 'Updated Description', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(200);
      expect(response.body).toEqual(mockProduct);
    });

    it('should handle product not found', async () => {
      Product.findByPk.mockResolvedValue(null);

      const response = await request(app)
        .patch('/1')
        .send({ name: 'Updated Product 1', price: 15, description: 'Updated Description', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(404);
    });

    it('should handle validation errors', async () => {
      const response = await request(app)
        .patch('/1')
        .send({ name: 'P1', price: -10, description: 'Desc', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(400);
      expect(response.body.error).toBeDefined();
    });

    it('should handle errors', async () => {
      Product.findByPk.mockRejectedValue(new Error('Database error'));

      const response = await request(app)
        .patch('/1')
        .send({ name: 'Updated Product 1', price: 15, description: 'Updated Description', reference: 'Ref1', tva: 20 });

      expect(response.status).toBe(500);
    });
  });

  describe('DELETE /:id', () => {
    it('should delete a product', async () => {
      Product.destroy.mockResolvedValue(1);

      const response = await request(app).delete('/1');

      expect(response.status).toBe(204);
    });

    it('should handle product not found', async () => {
      Product.destroy.mockResolvedValue(0);

      const response = await request(app).delete('/1');

      expect(response.status).toBe(404);
    });

    it('should handle errors', async () => {
      Product.destroy.mockRejectedValue(new Error('Database error'));

      const response = await request(app).delete('/1');

      expect(response.status).toBe(500);
    });
  });
});
