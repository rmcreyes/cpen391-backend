const mongoose = require('mongoose');
const supertest = require('supertest');
const http = require('http');

const app = require('../../app');

describe('Authentication Tests', () => {
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

  it('201 add car successful', async () => {
    const newCar = {
      carName: 'MY_CAR',
      licensePlate: '123ABC',
    };

    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(201);
    expect(res.body.carName).toEqual(newCar.carName);
    expect(res.body.licensePlate).toEqual(newCar.licensePlate.toUpperCase());
    expect(res.body.id).toBeTruthy();
    expect(res.body.userId).toEqual(userId);
  });

  it('201 add car without carName', async () => {
    const newCar = {
      licensePlate: '098XYZ',
    };

    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(201);
    expect(res.body.carName).toEqual(newCar.licensePlate.toUpperCase());
    expect(res.body.licensePlate).toEqual(newCar.licensePlate.toUpperCase());
    expect(res.body.id).toBeTruthy();
    expect(res.body.userId).toEqual(userId);
  });

  it('422 failed add car invalid input', async () => {
    const newCar = {
      licensePlate: '',
    };

    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Invalid inputs');
  });

  it('400 failed add car auth failed', async () => {
    const newCar = {
      licensePlate: '123ABC',
    };

    const res = await api
      .post(`/api/car/SOMETHING_ELSE`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Token missing or invalid');
  });

  it('422 failed add car existing license plate', async () => {
    const newCar = {
      licensePlate: '098XYZ',
    };

    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Car already exist');
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
