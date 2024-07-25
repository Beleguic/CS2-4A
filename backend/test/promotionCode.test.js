const request = require('supertest');
const express = require('express');
const promotionCodeController = require('../controllers/promotionCodeController');
const { PromotionCode, Product, Category, syncDB, closeDB } = require('../models');

const app = express();
app.use(express.json());

app.get('/promotion-codes', promotionCodeController.getAllPromotionCodes);
app.get('/promotion-codes/:id', promotionCodeController.getPromotionCodeById);
app.post('/promotion-codes/new', promotionCodeController.createPromotionCode);
app.patch('/promotion-codes/:id', promotionCodeController.updatePromotionCode);
app.delete('/promotion-codes/:id', promotionCodeController.deletePromotionCode);

describe('PromotionCode Model and API', () => {
  let testProduct;
  let testCategory;

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
    testCategory = await Category.create({
      name: `Test Category ${Math.random()}`,
      url: `test-category-${Math.random()}`,
      description: 'This is a test category',
      image: 'test-category-image-url'
    });
  });

  afterEach(async () => {
    await PromotionCode.destroy({ where: {} });
    await Product.destroy({ where: {} });
    await Category.destroy({ where: {} });
  });

  it('should create a new promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      reduction: 20,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };

    const res = await request(app)
      .post('/promotion-codes/new')
      .send(promotionCodeData);

    console.log('Create Response:', res.body);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.code).toBe(promotionCodeData.code);
  });

  it('should get all promotion codes', async () => {
    const res = await request(app).get('/promotion-codes');
    console.log('Get All Response:', res.body);
    expect(res.statusCode).toEqual(200);
  });

  it('should get a promotion code by id', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      reduction: 20,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);

    const res = await request(app).get(`/promotion-codes/${createdPromotionCode.id}`);
    console.log('Get By ID Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdPromotionCode.id);
  });

  it('should update a promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      reduction: 20,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);
    const updatedData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `UPDATED-PROMO-${Math.random().toString(36).substring(2, 15)}`,
      reduction: 30,
      start_at: new Date(),
      end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks later
    };

    const res = await request(app)
      .patch(`/promotion-codes/${createdPromotionCode.id}`)
      .send(updatedData);

    console.log('Update Response:', res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdPromotionCode.id);
    expect(res.body.code).toBe(updatedData.code);
    expect(res.body.reduction).toBe(updatedData.reduction);
  });

  it('should delete a promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      reduction: 20,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);

    const res = await request(app).delete(`/promotion-codes/${createdPromotionCode.id}`);
    console.log('Delete Response:', res.body);
    expect(res.statusCode).toEqual(204);
  });
});
