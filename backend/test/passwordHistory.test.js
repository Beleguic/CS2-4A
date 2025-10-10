const request = require('supertest');
const app = require('../server');
const { User, PasswordHistory, syncDB, closeDB } = require('../models');

describe('PasswordHistory API', () => {
  const testEmailPrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  let testUser;
  let testPasswordHistory;

  beforeEach(async () => {
    testUser = await User.create({
      email: `${testEmailPrefix}${Math.random()}@example.com`,
      password: 'password123',
      role: 'user',
      is_verified: false,
      login_attempts: 0,
      dateOfBirth: new Date(2000, 1, 1),
      username: `user_${Math.random()}`,
      firstName: 'Test',
      lastName: 'User'
    });

    testPasswordHistory = await PasswordHistory.create({
      user_id: testUser.id,
      hashed_password: 'oldpassword123',
    });
  });

  afterEach(async () => {
    await PasswordHistory.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  it('should create a new password history', async () => {
    const passwordHistoryData = {
      user_id: testUser.id,
      hashed_password: 'newpassword123',
    };

    const res = await request(app).post('/password_history/new').send(passwordHistoryData);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(passwordHistoryData.user_id);
  });

  it('should get all password histories', async () => {
    const res = await request(app).get('/password_history');
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
  });

  it('should get a password history by id', async () => {
    const res = await request(app).get(`/password_history/${testPasswordHistory.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', testPasswordHistory.id);
  });

  it('should update a password history', async () => {
    const updatedData = {
      user_id: testUser.id,
      hashed_password: 'updatedpassword123',
    };

    const res = await request(app).patch(`/password_history/${testPasswordHistory.id}`).send(updatedData);
    expect(res.statusCode).toEqual(200);
    expect(res.body.user_id).toBe(updatedData.user_id);
  });

  it('should delete a password history', async () => {
    const res = await request(app).delete(`/password_history/${testPasswordHistory.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
