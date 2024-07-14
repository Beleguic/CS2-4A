const request = require('supertest');
const app = require('../server');
const { Stock, Product, syncDB, closeDB } = require('../models');

describe('Stock Model and API', () => {
  let testProduct;

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    testProduct = await Product.create({
      name: `Test Product ${Math.random()}`,
      description: 'This is a test product',
      price: 100.00,
      brand: 'Test Brand',
      image: 'test-image-url'
    });
  });

  afterEach(async () => {
    await Stock.destroy({ where: {} });
    await Product.destroy({ where: {} });
  });

  it('should create a new stock', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
    };
    const res = await request(app).post('/stock/new').send(stockData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.quantity).toBe(stockData.quantity);
    expect(res.body.product_id).toBe(stockData.product_id);
  });

  it('should get all stocks', async () => {
    const res = await request(app).get('/stock');
    expect(res.statusCode).toEqual(200);
  });

  it('should get a stock by id', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
    };
    const createdStock = await Stock.create(stockData);

    const res = await request(app).get(`/stock/${createdStock.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdStock.id);
  });

  it('should update a stock', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
    };
    const createdStock = await Stock.create(stockData);
    const updatedData = {
      quantity: 20,
      product_id: testProduct.id,
    };

    const res = await request(app)
      .patch(`/stock/${createdStock.id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.quantity).toBe(updatedData.quantity);
  });

  it('should delete a stock', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
    };
    const createdStock = await Stock.create(stockData);

    const res = await request(app).delete(`/stock/${createdStock.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
