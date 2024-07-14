const request = require('supertest');
const app = require('../server');
const { sequelize, syncDB, closeDB, CategoryProduct, Category, Product } = require('../models');

describe('CategoryProduct Model and API', () => {
  let testCategory;
  let testProduct;

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    testCategory = await Category.create({
      name: `Test Category ${Math.random()}`,
      description: 'This is a test category',
      url: 'test-category-url',
      image: 'test-image-url'
    });
    testProduct = await Product.create({
      name: `Test Product ${Math.random()}`,
      description: 'This is a test product',
      price: 100.00,
      brand: 'Test Brand',
      image: 'test-image-url'
    });
  });

  afterEach(async () => {
    await CategoryProduct.destroy({ where: {} });
    await Category.destroy({ where: {} });
    await Product.destroy({ where: {} });
  });

  it('should create a new category product', async () => {
    const categoryProductData = {
      category_id: testCategory.id,
      product_id: testProduct.id,
    };
    const res = await request(app).post('/category_product/new').send(categoryProductData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.category_id).toBe(categoryProductData.category_id);
    expect(res.body.product_id).toBe(categoryProductData.product_id);
  });

  it('should get all category products', async () => {
    const res = await request(app).get('/category_product');
    expect(res.statusCode).toEqual(200);
  });

  it('should get a category product by id', async () => {
    const categoryProductData = {
      category_id: testCategory.id,
      product_id: testProduct.id,
    };
    const createdCategoryProduct = await CategoryProduct.create(categoryProductData);

    const res = await request(app).get(`/category_product/${createdCategoryProduct.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdCategoryProduct.id);
  });

  it('should update a category product', async () => {
    const categoryProductData = {
      category_id: testCategory.id,
      product_id: testProduct.id,
    };
    const createdCategoryProduct = await CategoryProduct.create(categoryProductData);
    const updatedData = {
      category_id: testCategory.id,
      product_id: testProduct.id,
    };

    const res = await request(app)
      .patch(`/category_product/${createdCategoryProduct.id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
    expect(res.body.category_id).toBe(updatedData.category_id);
    expect(res.body.product_id).toBe(updatedData.product_id);
  });

  it('should delete a category product', async () => {
    const categoryProductData = {
      category_id: testCategory.id,
      product_id: testProduct.id,
    };
    const createdCategoryProduct = await CategoryProduct.create(categoryProductData);

    const res = await request(app).delete(`/category_product/${createdCategoryProduct.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
