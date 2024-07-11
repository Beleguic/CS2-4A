const request = require('supertest');
const app = require('../server');
const { User, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

describe('User Model', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    try {
      await sequelize.sync({ force: true });
      console.log("Database synchronized successfully.");
    } catch (error) {
      console.error("Error synchronizing database:", error);
    }
  });

  afterEach(async () => {
    await User.destroy({
      where: {
        email: {
          [Sequelize.Op.like]: `${testEmailPrefix}%`
        }
      }
    });
  });

  afterAll(async () => {
    await sequelize.close();
  });

  it('should create a new user', async () => {
    const user = await User.create({
      email: `${testEmailPrefix}example@example.com`,
      password: 'Password123!',
      role: 'user',
      is_verified: false,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01'
    });
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(`${testEmailPrefix}example@example.com`);
  });

  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a user by id', async () => {
    const user = await User.create({
      email: `${testEmailPrefix}example@example.com`,
      password: 'Password123!',
      role: 'user',
      is_verified: false,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01'
    });

    const res = await request(app).get(`/users/${user.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', user.id);
  });

  it('should update a user', async () => {
    const user = await User.create({
      email: `${testEmailPrefix}example@example.com`,
      password: 'Password123!',
      role: 'user',
      is_verified: false,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01'
    });

    const res = await request(app)
      .patch(`/users/${user.id}`)
      .send({
        firstName: 'Updated',
        email: `${testEmailPrefix}example@example.com`,
        password: 'Password123!',
        role: 'user',
        is_verified: false,
        username: 'testuser',
        lastName: 'User',
        dateOfBirth: '2000-01-01'
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('firstName', 'Updated');
  });

  it('should delete a user', async () => {
    const user = await User.create({
      email: `${testEmailPrefix}example@example.com`,
      password: 'Password123!',
      role: 'user',
      is_verified: false,
      username: 'testuser',
      firstName: 'Test',
      lastName: 'User',
      dateOfBirth: '2000-01-01'
    });

    const res = await request(app).delete(`/users/${user.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
