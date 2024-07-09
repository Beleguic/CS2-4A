const request = require('supertest');
const app = require('../server'); // Importer l'application sans démarrer le serveur
const { User } = require('../models');
const { sequelize } = require('../models');

// Nettoyage de la base de données avant chaque test
beforeEach(async () => {
  await sequelize.sync({ force: true });
});

// Fermer la connexion à la base de données après tous les tests
afterAll(async () => {
  await sequelize.close();
});

describe('User API', () => {
  it('should create a new user', async () => {
    const res = await request(app)
      .post('/users/new')
      .send({
        email: 'test@example.com',
        password: 'password123',
        role: 'user',
        is_verified: false,
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        dateOfBirth: '2000-01-01'
      });
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
  });

  it('should get all users', async () => {
    const res = await request(app).get('/users');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get a user by id', async () => {
    const user = await User.create({
      email: 'test@example.com',
      password: 'password123',
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
      email: 'test@example.com',
      password: 'password123',
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
        email: 'test@example.com', // Add all required fields to avoid validation error
        password: 'password123',
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
      email: 'test@example.com',
      password: 'password123',
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
