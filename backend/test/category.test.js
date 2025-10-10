const request = require('supertest');
const app = require('../server');
const { Category, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

describe('Category Model and API', () => {
  const testCategoryPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    try {
      await sequelize.sync({ force: true });
      console.log("Database synchronized successfully.");
    } catch (error) {
      console.error("Error synchronizing database:", error);
    }
  });

  afterEach(async () => {
    await Category.destroy({
      where: {
        name: {
          [Sequelize.Op.like]: `${testCategoryPrefix}%`
        }
      }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new category', async () => {
    const categoryData = {
      name: `${testCategoryPrefix}category`,
      url: `${testCategoryPrefix}url`.replace(/_/g, '-'),  // Remplacer les underscores par des tirets pour correspondre au pattern
      description: 'A test category',
      image: 'http://example.com/image.png',
      is_active: true
    };
    const res = await request(app)
      .post('/category/new')
      .send(categoryData);
    console.log(res.body);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.name).toBe(categoryData.name);
  });

  it('should get all categories', async () => {
    const res = await request(app).get('/category');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a category by id', async () => {
    const categoryData = {
      name: `${testCategoryPrefix}getcategory`,
      url: `${testCategoryPrefix}geturl`.replace(/_/g, '-'),
      description: 'A test category',
      image: 'http://example.com/image.png',
      is_active: true
    };
    const createdCategory = await Category.create(categoryData);
    const res = await request(app).get(`/category/${createdCategory.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdCategory.id);
  });

  it('should update a category', async () => {
    const categoryData = {
      name: `${testCategoryPrefix}updatecategory`,
      url: `${testCategoryPrefix}updateurl`.replace(/_/g, '-'),
      description: 'A test category',
      image: 'http://example.com/image.png',
      is_active: true
    };
    const createdCategory = await Category.create(categoryData);
    const updatedData = {
      name: `${testCategoryPrefix}updated`,
      url: `${testCategoryPrefix}updatedurl`.replace(/_/g, '-'),
      description: 'An updated test category',
      image: 'http://example.com/updatedimage.png',
      is_active: true
    };
    const res = await request(app)
      .patch(`/category/${createdCategory.id}`)
      .send(updatedData);
    console.log(res.body);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('name', updatedData.name);
  });

  it('should delete a category', async () => {
    const categoryData = {
      name: `${testCategoryPrefix}deletecategory`,
      url: `${testCategoryPrefix}deleteurl`.replace(/_/g, '-'),
      description: 'A test category',
      image: 'http://example.com/image.png',
      is_active: true
    };
    const createdCategory = await Category.create(categoryData);
    const res = await request(app).delete(`/category/${createdCategory.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
