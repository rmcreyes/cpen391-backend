const mongoose = require('mongoose');
const supertest = require('supertest');
const http = require('http');

const app = require('../../app');

describe('Meter Tests', () => {
  let server, api;
  beforeAll(done => {
    server = http.createServer(app);
    server.listen(done);
    api = supertest(server);
  });

  let userId, token;
  it('201 should succeed to sign up if every input is correct', async () => {
    const newUser = {
      firstName: 'TESTING',
      lastName: 'TESTING',
      email: 'testing@testing.com',
      password: 'TESTING',
    };

    const res = await api.post('/api/user/signup').send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.email).toEqual(newUser.email.toLowerCase());
    expect(res.body.userId).toBeTruthy();
    expect(res.body.token).toBeTruthy();

    userId = res.body.userId;
    token = res.body.token;
  });

  const newMeter = {
    unitPrice: 12,
  };
  it('201 add meter', async () => {
    const res = await api.post('/api/meter/addMeter').send(newMeter);

    expect(res.statusCode).toEqual(201);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.occupied).toEqual(false);
    expect(res.body.updated).toBeTruthy();
    expect(res.body.id).toBeTruthy();

    newMeter.id = res.body.id;
  });

  it('200 get meter status', async () => {
    const res = await api.get(`/api/meter/${newMeter.id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.occupied).toEqual(false);
    expect(res.body.updated).toBeTruthy();
    expect(res.body.id).toEqual(newMeter.id);
  });

  it('200 update meter status', async () => {
    const res = await api.put(`/api/meter/${newMeter.id}`).send({ occupied: true });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.occupied).toEqual(true);
    expect(res.body.updated).toBeTruthy();
    expect(res.body.id).toEqual(newMeter.id);
  });

  it('200 get meter status', async () => {
    const res = await api.get(`/api/meter/${newMeter.id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.occupied).toEqual(true);
    expect(res.body.updated).toBeTruthy();
    expect(res.body.id).toEqual(newMeter.id);
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
