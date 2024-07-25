const request = require('supertest');
const app = require('../server');
const { User, syncDB, closeDB } = require('../models');

describe('User Routes', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  let testUserId;

  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users/new')
      .send({
        email: `${testEmailPrefix}example@example.com`,
        password: 'Password123!',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '2000-01-01',
        isSubscribedToNewsletter: false
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    testUserId = res.body.id;
  });

  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should get a user by id', async () => {
    const res = await request(app).get(`/users/${testUserId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testUserId);
  });

  it('should update a user', async () => {
    const res = await request(app)
      .patch(`/users/${testUserId}`)
      .send({ firstName: 'Updated' });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('firstName', 'Updated');
  });

  it('should delete a user', async () => {
    const res = await request(app).delete(`/users/${testUserId}`);
    expect(res.statusCode).toEqual(204);
  });
});
