const request = require('supertest');
const express = require('express');
const productPromotionController = require('../controllers/productPromotionController');
const { ProductPromotion, Product, syncDB, closeDB } = require('../models');

const app = express();
app.use(express.json());

app.get('/product-promotions', productPromotionController.getAllProductPromotions);
app.get('/product-promotions/:id', productPromotionController.getProductPromotionById);
app.post('/product-promotions/new', productPromotionController.createProductPromotion);
app.patch('/product-promotions/:id', productPromotionController.updateProductPromotion);
app.delete('/product-promotions/:id', productPromotionController.deleteProductPromotion);

describe('ProductPromotion Model and API', () => {
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
    await ProductPromotion.destroy({ where: {} });
    await Product.destroy({ where: {} });
  });

  it('should create a new product promotion', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };

    const res = await request(app)
      .post('/product-promotions/new')
      .send(productPromotionData);

    console.log('Create Response:', res.body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.product_id).toBe(productPromotionData.product_id);
  });

  it('should get all product promotions', async () => {
    const res = await request(app).get('/product-promotions');
    console.log('Get All Response:', res.body);
    expect(res.statusCode).toEqual(200);
  });

  it('should get a product promotion by id', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdProductPromotion = await ProductPromotion.create(productPromotionData);

    const res = await request(app).get(`/product-promotions/${createdProductPromotion.id}`);
    console.log('Get By ID Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdProductPromotion.id);
  });

  it('should update a product promotion', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdProductPromotion = await ProductPromotion.create(productPromotionData);
    const updatedData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks later
    };

    const res = await request(app)
      .patch(`/product-promotions/${createdProductPromotion.id}`)
      .send(updatedData);

    console.log('Update Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdProductPromotion.id);
    expect(new Date(res.body.end_at)).toEqual(updatedData.end_at);
  });

  it('should delete a product promotion', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdProductPromotion = await ProductPromotion.create(productPromotionData);

    const res = await request(app).delete(`/product-promotions/${createdProductPromotion.id}`);
    console.log('Delete Response:', res.body);
    expect(res.statusCode).toEqual(204);
  });
});
