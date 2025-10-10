const request = require('supertest');
const express = require('express');
const stockController = require('../controllers/stockController');
const { Stock, Product, syncDB, closeDB } = require('../models');

const app = express();
app.use(express.json());

app.get('/stocks', stockController.getAllStocks);
app.get('/stocks/:id', stockController.getStockById);
app.post('/stocks/new', stockController.createStock);
app.patch('/stocks/:id', stockController.updateStock);
app.delete('/stocks/:id', stockController.deleteStock);

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
      image: 'test-image-url',
      reference: `Ref${Math.random()}`,
      tva: 20.0
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
      status: 'in_stock',
      difference: 'none'
    };
    const res = await request(app).post('/stocks/new').send(stockData);
    console.log('Create Stock Response:', res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.quantity).toBe(stockData.quantity);
    expect(res.body.product_id).toBe(stockData.product_id);
  });

  it('should get all stocks', async () => {
    const res = await request(app).get('/stocks');
    console.log('Get All Stocks Response:', res.body);
    expect(res.statusCode).toEqual(200);
  });

  it('should get a stock by id', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
      status: 'in_stock',
      difference: 'none'
    };
    const createdStock = await Stock.create(stockData);

    const res = await request(app).get(`/stocks/${createdStock.id}`);
    console.log('Get Stock By ID Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdStock.id);
  });

  it('should update a stock', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
      status: 'in_stock',
      difference: 'none'
    };
    const createdStock = await Stock.create(stockData);
    const updatedData = {
      quantity: 20,
      product_id: testProduct.id,
      status: 'in_stock',
      difference: 'none'
    };

    const res = await request(app)
      .patch(`/stocks/${createdStock.id}`)
      .send(updatedData);
    console.log('Update Stock Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body.quantity).toBe(updatedData.quantity);
  });

  it('should delete a stock', async () => {
    const stockData = {
      quantity: 10,
      product_id: testProduct.id,
      status: 'in_stock',
      difference: 'none'
    };
    const createdStock = await Stock.create(stockData);

    const res = await request(app).delete(`/stocks/${createdStock.id}`);
    console.log('Delete Stock Response:', res.body);
    expect(res.statusCode).toEqual(204);
  });
});
