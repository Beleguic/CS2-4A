const request = require('supertest');
const app = require('../server'); // Importer l'application sans démarrer le serveur
const { AlertType, Category, Product, sequelize } = require('../models');
const { Sequelize } = require('sequelize');

describe('AlertType Model and API', () => {
  const testAlertTypePrefix = 'test_' + Date.now() + '_';

  beforeAll(async () => {
    try {
      // Synchroniser la base de données avant tous les tests
      await sequelize.sync({ force: true });
      console.log("Database synchronized successfully.");
    } catch (error) {
      console.error("Error synchronizing database:", error);
    }
  });

  afterEach(async () => {
    // Nettoyer les données de test après chaque test
    await AlertType.destroy({
      where: {
        type: {
          [Sequelize.Op.like]: `${testAlertTypePrefix}%`
        }
      }
    });
  });

  afterAll(async () => {
    // Fermer la connexion à la base de données après tous les tests
    await sequelize.close();
  });

  it('should create a new alert type', async () => {
    const alertTypeData = {
      type: `${testAlertTypePrefix}type`
    };
    const res = await request(app)
      .post('/alert_types/new')
      .send(alertTypeData);
    console.log(res.body); // Ajoutez ceci pour déboguer la réponse
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.type).toBe(alertTypeData.type);
  });

  it('should get all alert types', async () => {
    const res = await request(app).get('/alert_types');
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
  });

  it('should get an alert type by id', async () => {
    const alertTypeData = {
      type: `${testAlertTypePrefix}gettype`
    };
    const createdAlertType = await AlertType.create(alertTypeData);
    const res = await request(app).get(`/alert_types/${createdAlertType.id}`);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('id', createdAlertType.id);
  });

  it('should update an alert type', async () => {
    const alertTypeData = {
      type: `${testAlertTypePrefix}updatetype`
    };
    const createdAlertType = await AlertType.create(alertTypeData);
    const updatedData = {
      type: `${testAlertTypePrefix}updated`
    };
    const res = await request(app)
      .patch(`/alert_types/${createdAlertType.id}`)
      .send(updatedData);
    console.log(res.body); // Ajoutez ceci pour déboguer la réponse
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('type', updatedData.type);
  });

  it('should delete an alert type', async () => {
    const alertTypeData = {
      type: `${testAlertTypePrefix}deletetype`
    };
    const createdAlertType = await AlertType.create(alertTypeData);
    const res = await request(app).delete(`/alert_types/${createdAlertType.id}`);
    expect(res.statusCode).toEqual(204);
  });
});
