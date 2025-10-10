const request = require('supertest');
const app = require('../server');
const { syncDB, closeDB } = require('../models');

describe('Stripe Routes', () => {
  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  it('should create a new payment intent with valid amount', async () => {
    const res = await request(app)
      .post('/stripe/new')
      .send({ amount: 2000 });

    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('clientSecret');
  });

  it('should return validation error for invalid amount', async () => {
    const res = await request(app)
      .post('/stripe/new')
      .send({ amount: -1000 });

    expect(res.statusCode).toEqual(400);
    expect(res.body).toHaveProperty('error');
  });
});
