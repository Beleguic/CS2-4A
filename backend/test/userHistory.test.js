const request = require('supertest');
const app = require('../server');
const { UserHistory, syncDB, closeDB } = require('../models');

describe('UserHistory API', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    await syncDB();
  });

  beforeEach(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  let testUserHistory;

  beforeEach(async () => {
    testUserHistory = await UserHistory.create({
      email: `${testEmailPrefix}${Math.random()}@example.com`,
      password: 'password123',
      role: 'user',
      is_verified: false,
      login_attempts: 0,
    });
  });

  afterEach(async () => {
    await UserHistory.destroy({ where: {} });
  });

  it('should create a new user history', async () => {
    const userHistoryData = {
      email: `${testEmailPrefix}${Math.random()}@example.com`,
      password: 'password123',
      role: 'user',
      is_verified: false,
      login_attempts: 0,
    };

    const res = await request(app).post('/user_history/new').send(userHistoryData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(userHistoryData.email);
  });

  it('should get all user histories', async () => {
    const res = await request(app).get('/user_history');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a user history by id', async () => {
    const res = await request(app).get(`/user_history/${testUserHistory.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testUserHistory.id);
  });

  it('should update a user history', async () => {
    const updatedData = {
      email: `updated${Math.random()}@example.com`,
      password: 'newpassword123',
      role: 'admin',
      is_verified: true,
      login_attempts: 1,
    };

    const res = await request(app).patch(`/user_history/${testUserHistory.id}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toBe(updatedData.email);
    expect(res.body.role).toBe(updatedData.role);
  });

  it('should delete a user history', async () => {
    const res = await request(app).delete(`/user_history/${testUserHistory.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
