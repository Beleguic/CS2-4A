const request = require('supertest');
const app = require('../server');
const { Product, Category, sequelize } = require('../models');

describe('Product API', () => {
  // Synchroniser la base de données avant chaque test
  beforeAll(async () => {
    await sequelize.sync({ force: true });
  });

  // Nettoyage de la base de données avant chaque test
  beforeEach(async () => {
    await sequelize.sync({ force: true });
  });

  // Fermer la connexion à la base de données après tous les tests
  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new product', async () => {
    const res = await request(app)
      .post('/product/new')
      .send({
        name: 'Test Product',
        brand: 'Test Brand',
        price: 99.99,
        image: 'http://example.com/image.png',
        is_active: true
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe('Test Product');
  });

  it('should get all products', async () => {
    const res = await request(app).get('/product');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a product by id', async () => {
    const product = await Product.create({
      name: 'Test Product',
      brand: 'Test Brand',
      price: 99.99,
      image: 'http://example.com/image.png',
      is_active: true
    });
    const res = await request(app).get(`/product/${product.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', product.id);
  });

  it('should update a product', async () => {
    const product = await Product.create({
      name: 'Test Product',
      brand: 'Test Brand',
      price: 99.99,
      image: 'http://example.com/image.png',
      is_active: true
    });
    const res = await request(app)
      .patch(`/product/${product.id}`)
      .send({
        name: 'Updated Product',
        brand: 'Test Brand',
        price: 99.99,
        image: 'http://example.com/image.png',
        is_active: true
      });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', 'Updated Product');
  });

  it('should delete a product', async () => {
    const product = await Product.create({
      name: 'Test Product',
      brand: 'Test Brand',
      price: 99.99,
      image: 'http://example.com/image.png',
      is_active: true
    });
    const res = await request(app).delete(`/product/${product.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
