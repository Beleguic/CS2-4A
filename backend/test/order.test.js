const request = require('supertest');
const app = require('../server');
const { sequelize, syncDB, closeDB, Order, User } = require('../models');

describe('Order Model and API', () => {
  let testUser;
  let testOrder;

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await Order.destroy({ where: {} });
    await User.destroy({ where: {} });

    testUser = await User.create({
      username: `testuser${Math.random()}`,
      email: `testuser${Math.random()}@example.com`,
      password: 'password123'
    });

    testOrder = await Order.create({
      user_id: testUser.id,
      products: [
        {
          product_id: 'test-product-id',
          name: 'Test Product',
          quantity: 2,
          price: 50.00,
          image: 'test-image-url',
          reference: 'test-reference',
          is_adult: false,
          tva: 20.00,
        },
      ],
      total: 100.00,
      tva: 20.00,
      isPayed: false,
      livraison: 'standard',
      adresseFacturation: {
        address: '123 Test St',
        city: 'Test City',
        zip: '12345',
        country: 'Test Country',
      },
      created_at: new Date(),
    });
  });

  afterEach(async () => {
    await Order.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  it('should create a new order', async () => {
    const orderData = {
      user_id: testUser.id,
      products: [
        {
          product_id: 'new-test-product-id',
          name: 'New Test Product',
          quantity: 1,
          price: 75.00,
          image: 'new-test-image-url',
          reference: 'new-test-reference',
          is_adult: false,
          tva: 15.00,
        },
      ],
      total: 75.00,
      tva: 15.00,
      isPayed: false,
      livraison: 'express',
      adresseFacturation: {
        address: '456 New Test St',
        city: 'New Test City',
        zip: '67890',
        country: 'New Test Country',
      },
    };

    const res = await request(app).post('/orders/new').send(orderData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(orderData.user_id);
    expect(res.body.total).toBe(orderData.total);
  });

  it('should get all orders', async () => {
    const res = await request(app).get('/orders');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get an order by id', async () => {
    const res = await request(app).get(`/orders/${testOrder.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testOrder.id);
  });

  it('should update an order', async () => {
    const updatedData = {
      user_id: testUser.id,
      products: [
        {
          product_id: 'updated-test-product-id',
          name: 'Updated Test Product',
          quantity: 3,
          price: 150.00,
          image: 'updated-test-image-url',
          reference: 'updated-test-reference',
          is_adult: false,
          tva: 30.00,
        },
      ],
      total: 150.00,
      tva: 30.00,
      isPayed: true,
      livraison: 'overnight',
      adresseFacturation: {
        address: '789 Updated Test St',
        city: 'Updated Test City',
        zip: '11111',
        country: 'Updated Test Country',
      },
    };

    const res = await request(app).patch(`/orders/${testOrder.id}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.total).toBe(updatedData.total);
    expect(res.body.isPayed).toBe(updatedData.isPayed);
  });

  it('should delete an order', async () => {
    const res = await request(app).delete(`/orders/${testOrder.id}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should return 404 if order not found for get', async () => {
    const res = await request(app).get('/orders/invalid-id');
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 if order not found for update', async () => {
    const updatedData = {
      user_id: testUser.id,
      products: [
        {
          product_id: 'updated-test-product-id',
          name: 'Updated Test Product',
          quantity: 3,
          price: 150.00,
          image: 'updated-test-image-url',
          reference: 'updated-test-reference',
          is_adult: false,
          tva: 30.00,
        },
      ],
      total: 150.00,
      tva: 30.00,
      isPayed: true,
      livraison: 'overnight',
      adresseFacturation: {
        address: '789 Updated Test St',
        city: 'Updated Test City',
        zip: '11111',
        country: 'Updated Test Country',
      },
    };

    const res = await request(app).patch('/orders/invalid-id').send(updatedData);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 for invalid data on create', async () => {
    const invalidData = {
      user_id: 'invalid-uuid',
      products: 'invalid-products',
      total: 'invalid-total',
      tva: 'invalid-tva',
      isPayed: 'invalid-isPayed',
      livraison: 'invalid-livraison',
      adresseFacturation: 'invalid-adresseFacturation',
    };

    const res = await request(app).post('/orders/new').send(invalidData);
    expect(res.statusCode).toEqual(400);
  });

  it('should return 400 for invalid data on update', async () => {
    const invalidData = {
      user_id: 'invalid-uuid',
      products: 'invalid-products',
      total: 'invalid-total',
      tva: 'invalid-tva',
      isPayed: 'invalid-isPayed',
      livraison: 'invalid-livraison',
      adresseFacturation: 'invalid-adresseFacturation',
    };

    const res = await request(app).patch(`/orders/${testOrder.id}`).send(invalidData);
    expect(res.statusCode).toEqual(400);
  });
});
