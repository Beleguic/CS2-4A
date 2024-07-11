const request = require('supertest');
const app = require('../server');
const { User, syncDB, closeDB } = require('../models');

describe('User Model', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('should create a new user', async () => {
    try {
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
    } catch (error) {
      console.error("Error creating user:", error);
    }
  });

  it('should get all users', async () => {
    try {
      const res = await request(app).get('/users');
      expect(res.statusCode).toEqual(200);
      expect(res.body).toBeInstanceOf(Array);
    } catch (error) {
      console.error("Error getting all users:", error);
    }
  });

  it('should get a user by id', async () => {
    try {
      const newUser = await User.create({
        email: `${testEmailPrefix}example2@example.com`,
        password: 'Password123!',
        role: 'user',
        is_verified: false,
        username: 'testuser2',
        firstName: 'Test2',
        lastName: 'User2',
        dateOfBirth: '2000-01-01'
      });

      const res = await request(app).get(`/users/${newUser.id}`);
      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('id', newUser.id);
    } catch (error) {
      console.error("Error getting user by id:", error);
    }
  });

  it('should update a user', async () => {
    try {
      const user = await User.create({
        email: `${testEmailPrefix}example3@example.com`,
        password: 'Password123!',
        role: 'user',
        is_verified: false,
        username: 'testuser3',
        firstName: 'Test3',
        lastName: 'User3',
        dateOfBirth: '2000-01-01'
      });

      console.log('Created user for update:', user);

      const res = await request(app)
        .patch(`/users/${user.id}`)
        .send({
          firstName: 'Updated',
          email: `${testEmailPrefix}example3@example.com`,
          password: 'Password123!',
          role: 'user',
          is_verified: false,
          username: 'testuser3',
          lastName: 'User3',
          dateOfBirth: '2000-01-01'
        });

      console.log('Update response:', res.body);

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('firstName', 'Updated');
    } catch (error) {
      console.error("Error updating user:", error);
    }
  });

  it('should delete a user', async () => {
    try {
      const user = await User.create({
        email: `${testEmailPrefix}example4@example.com`,
        password: 'Password123!',
        role: 'user',
        is_verified: false,
        username: 'testuser4',
        firstName: 'Test4',
        lastName: 'User4',
        dateOfBirth: '2000-01-01'
      });

      console.log('Created user for delete:', user);

      const res = await request(app).delete(`/users/${user.id}`);

      console.log('Delete response:', res.body);

      expect(res.statusCode).toEqual(204);
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  });
});
