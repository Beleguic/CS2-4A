const request = require('supertest');
const app = require('../server');
const { PromotionCode, Product, Category, syncDB, closeDB } = require('../models');

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
      brand: 'Test Brand',
      image: 'test-image-url'
    });
    testCategory = await Category.create({
      name: `Test Category ${Math.random()}`,
      url: `test-category-${Math.random()}`,
      description: 'This is a test category',
      image: 'test-category-image-url'
    });
  });

  it('should create a new promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };

    const res = await request(app)
      .post('/promotion_code/new')
      .send(promotionCodeData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.code).toBe(promotionCodeData.code);
  });

  it('should get all promotion codes', async () => {
    const res = await request(app).get('/promotion_code');
    expect(res.statusCode).toEqual(200);
  });

  it('should get a promotion code by id', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);

    const res = await request(app).get(`/promotion_code/${createdPromotionCode.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdPromotionCode.id);
  });

  it('should update a promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);
    const updatedData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `UPDATED-PROMO-${Math.random().toString(36).substring(2, 15)}`,
      start_at: new Date(),
      end_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 2 weeks later
    };

    const res = await request(app)
      .patch(`/promotion_code/${createdPromotionCode.id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
  });

  it('should delete a promotion code', async () => {
    const promotionCodeData = {
      product_id: testProduct.id,
      category_id: testCategory.id,
      code: `PROMO-${Math.random().toString(36).substring(2, 15)}`,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdPromotionCode = await PromotionCode.create(promotionCodeData);

    const res = await request(app).delete(`/promotion_code/${createdPromotionCode.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
