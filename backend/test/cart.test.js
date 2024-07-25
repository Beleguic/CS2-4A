const request = require('supertest');
const app = require('../server');
const { sequelize, syncDB, closeDB, Cart, User } = require('../models');

describe('Cart Model and API', () => {
  let testUser;
  let testCart;

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    await Cart.destroy({ where: {} });
    await User.destroy({ where: {} });

    testUser = await User.create({
      username: `testuser${Math.random()}`,
      email: `testuser${Math.random()}@example.com`,
      password: 'password123',
      date_of_birth: new Date('1990-01-01'),
      first_name: 'Test',
      last_name: 'User'
    });

    testCart = await Cart.create({
      user_id: testUser.id,
      cartProductsData: [
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
      updated_at: new Date(),
      created_at: new Date(),
      expired_at: new Date(Date.now() + 15 * 60 * 1000),
    });
  });

  afterEach(async () => {
    await Cart.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  it('should create a new cart', async () => {
    const cartData = {
      user_id: testUser.id,
      cartProductsData: [
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
    };

    const res = await request(app).post('/carts/new').send(cartData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(cartData.user_id);
  });

  it('should get all carts', async () => {
    const res = await request(app).get('/carts');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a cart by id', async () => {
    const res = await request(app).get(`/carts/${testCart.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testCart.id);
  });

  it('should update a cart', async () => {
    const updatedData = {
      user_id: testUser.id,
      cartProductsData: [
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
    };

    const res = await request(app).patch(`/carts/${testCart.id}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.cartProductsData[0].name).toBe(updatedData.cartProductsData[0].name);
  });

  it('should delete a cart', async () => {
    const res = await request(app).delete(`/carts/${testCart.id}`);
    expect(res.statusCode).toEqual(204);
  });

  it('should remove a product from a cart', async () => {
    const res = await request(app).delete('/carts').send({ user_id: testUser.id, product_id: 'test-product-id' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.cartProductsData.length).toBe(0);
  });

  it('should get total product count by product ID', async () => {
    const res = await request(app).get('/carts/product/count').query({ product_id: 'test-product-id' });
    expect(res.statusCode).toEqual(200);
    expect(res.body.total_count).toBe(2);
  });

  it('should get cart by user ID', async () => {
    const res = await request(app).get(`/carts/user/${testUser.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('user_id', testUser.id);
  });

  it('should return 404 if cart not found for get by ID', async () => {
    const res = await request(app).get('/carts/invalid-id');
    expect(res.statusCode).toEqual(404);
  });

  it('should return 404 if cart not found for update', async () => {
    const updatedData = {
      user_id: testUser.id,
      cartProductsData: [
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
    };

    const res = await request(app).patch('/carts/invalid-id').send(updatedData);
    expect(res.statusCode).toEqual(404);
  });

  it('should return 400 for invalid data on create', async () => {
    const invalidData = {
      user_id: 'invalid-uuid',
      cartProductsData: 'invalid-products-data',
    };

    const res = await request(app).post('/carts/new').send(invalidData);
    expect(res.statusCode).toEqual(400);
  });

  it('should return 400 for invalid data on update', async () => {
    const invalidData = {
      user_id: 'invalid-uuid',
      cartProductsData: 'invalid-products-data',
    };

    const res = await request(app).patch(`/carts/${testCart.id}`).send(invalidData);
    expect(res.statusCode).toEqual(400);
  });
});
