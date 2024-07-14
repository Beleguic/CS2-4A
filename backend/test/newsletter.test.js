const request = require('supertest');
const app = require('../server');
const { Newsletter, User, syncDB, closeDB } = require('../models');

describe('Newsletter Model and API', () => {
  let testUser;

  beforeAll(async () => {
    await syncDB();
  });

  afterAll(async () => {
    await closeDB();
  });

  beforeEach(async () => {
    testUser = await User.create({
      email: `test${Math.random()}@example.com`,
      dateOfBirth: new Date(2000, 1, 1),
      password: 'password123',
      username: `user${Math.random()}`,
      firstName: 'Test',
      lastName: 'User'
    });
  });

  it('should create a new newsletter', async () => {
    const newsletterData = {
      user_id: testUser.id
    };
    console.log('Using user ID:', testUser.id);

    const res = await request(app)
      .post('/newsletter/new')
      .send(newsletterData);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.user_id).toBe(newsletterData.user_id);
  });

  it('should get all newsletters', async () => {
    const res = await request(app).get('/newsletter');
    expect(res.statusCode).toEqual(200);
  });

  it('should get a newsletter by id', async () => {
    const newsletterData = {
      user_id: testUser.id
    };
    const createdNewsletter = await Newsletter.create(newsletterData);

    const res = await request(app).get(`/newsletter/${createdNewsletter.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdNewsletter.id);
  });

  it('should update a newsletter', async () => {
    const newsletterData = {
      user_id: testUser.id
    };
    const createdNewsletter = await Newsletter.create(newsletterData);
    const updatedData = {
      user_id: testUser.id,
    };

    const res = await request(app)
      .patch(`/newsletter/${createdNewsletter.id}`)
      .send(updatedData);

    expect(res.statusCode).toEqual(200);
  });

  it('should delete a newsletter', async () => {
    const newsletterData = {
      user_id: testUser.id
    };
    const createdNewsletter = await Newsletter.create(newsletterData);

    const res = await request(app).delete(`/newsletter/${createdNewsletter.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
