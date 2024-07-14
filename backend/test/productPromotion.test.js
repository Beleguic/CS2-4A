const request = require('supertest');
const app = require('../server');
const { ProductPromotion, Product, syncDB, closeDB } = require('../models');

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
      brand: 'Test Brand',
      image: 'test-image-url'
    });
  });

  it('should create a new product promotion', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };

    const res = await request(app)
      .post('/product_promotion/new')
      .send(productPromotionData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.product_id).toBe(productPromotionData.product_id);
  });

  it('should get all product promotions', async () => {
    const res = await request(app).get('/product_promotion');
    expect(res.statusCode).toEqual(200);
  });

  it('should get a product promotion by id', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdProductPromotion = await ProductPromotion.create(productPromotionData);

    const res = await request(app).get(`/product_promotion/${createdProductPromotion.id}`);
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
      .patch(`/product_promotion/${createdProductPromotion.id}`)
      .send(updatedData);

    console.log('Product Promotion Update Response:', res.body);
    expect(res.statusCode).toEqual(200);
  });

  it('should delete a product promotion', async () => {
    const productPromotionData = {
      product_id: testProduct.id,
      start_at: new Date(),
      end_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 1 week later
    };
    const createdProductPromotion = await ProductPromotion.create(productPromotionData);

    const res = await request(app).delete(`/product_promotion/${createdProductPromotion.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
