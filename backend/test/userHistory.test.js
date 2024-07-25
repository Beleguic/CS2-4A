const request = require('supertest');
const app = require('../server');
const { UserHistory, syncDB, closeDB } = require('../models');

describe('UserHistory Routes', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  let testUserHistoryId;

  it('should create a new user history', async () => {
    const res = await request(app)
      .post('/userHistories/new')
      .send({
        email: `${testEmailPrefix}example@example.com`,
        password: 'Password123!',
        role: 'user',
        is_verified: false,
        login_attempts: 0,
        password_last_changed: new Date()
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    testUserHistoryId = res.body.id;
  });

  it('should get all user histories', async () => {
    const res = await request(app).get('/userHistories');
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBeTruthy();
  });

  it('should get a user history by id', async () => {
    const res = await request(app).get(`/userHistories/${testUserHistoryId}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testUserHistoryId);
  });

  it('should update a user history', async () => {
    const res = await request(app)
      .patch(`/userHistories/${testUserHistoryId}`)
      .send({ login_attempts: 1 });
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('login_attempts', 1);
  });

  it('should delete a user history', async () => {
    const res = await request(app).delete(`/userHistories/${testUserHistoryId}`);
    expect(res.statusCode).toEqual(204);
  });
});
