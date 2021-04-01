const mongoose = require('mongoose');
const supertest = require('supertest');
const http = require('http');

const app = require('../../app');

describe('Car Tests', () => {
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

  it('404 not found any car because none are added', async () => {
    const res = await api
      .get(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found');
  });

  it('401 auth fail', async () => {
    const res = await api
      .get(`/api/car/${userId}`)
      .set('Authorization', `BAD AUTH`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Authentication failed!');
  });

  it('401 auth fail', async () => {
    const res = await api
      .get(`/api/car/${userId}`)
      .set('Authorization', `Bear FAIL_TOKEN`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Authentication failed!');
  });

  let carOne = {
    carName: 'MY_CAR',
    licensePlate: '123ABC',
  };
  it('201 add car successful', async () => {
    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(carOne);

    expect(res.statusCode).toEqual(201);
    expect(res.body.carName).toEqual(carOne.carName);
    expect(res.body.licensePlate).toEqual(carOne.licensePlate.toUpperCase());
    expect(res.body.id).toBeTruthy();
    expect(res.body.userId).toEqual(userId);

    carOne.id = res.body.id;
  });

  let carTwo = {
    licensePlate: '098CBA',
  };
  it('201 add car without carName', async () => {
    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(carTwo);

    expect(res.statusCode).toEqual(201);
    expect(res.body.carName).toEqual(carTwo.licensePlate.toUpperCase());
    expect(res.body.licensePlate).toEqual(carTwo.licensePlate.toUpperCase());
    expect(res.body.id).toBeTruthy();
    expect(res.body.userId).toEqual(userId);

    carTwo.id = res.body.id;
  });

  it('200 get all cars', async () => {
    const res = await api
      .get(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.cars.length).toEqual(2);
    expect(res.body.cars[0].licensePlate).toEqual(carOne.licensePlate);
    expect(res.body.cars[0].id).toEqual(carOne.id);
    expect(res.body.cars[1].licensePlate).toEqual(carTwo.licensePlate);
    expect(res.body.cars[1].id).toEqual(carTwo.id);
  });

  it('200 get one car', async () => {
    let res = await api
      .get(`/api/car/${userId}/${carOne.id}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.licensePlate).toEqual(carOne.licensePlate);
    expect(res.body.id).toEqual(carOne.id);
    expect(res.body.name).toEqual(carOne.name);
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
      licensePlate: carOne.licensePlate,
    };

    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newCar);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Car already exist');
  });

  it('200 delete one car', async () => {
    let res = await api
      .delete(`/api/car/${userId}/${carOne.id}/`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toEqual('Deleted car');
  });

  it('404 already deleted car', async () => {
    let res = await api
      .delete(`/api/car/${userId}/${carOne.id}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found or already deleted');
  });

  it('200 get all cars (should only have one now)', async () => {
    const res = await api
      .get(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.cars.length).toEqual(1);
    expect(res.body.cars[0].licensePlate).toEqual(carTwo.licensePlate);
    expect(res.body.cars[0].id).toEqual(carTwo.id);
  });

  it('200 update one car', async () => {
    let newName = 'NEW_CAR_NAME';

    const res = await api
      .put(`/api/car/${userId}/${carTwo.id}`)
      .set('Authorization', `Bear ${token}`)
      .send({ carName: newName });

    expect(res.statusCode).toEqual(200);
    expect(res.body.carName).toEqual(newName);
    expect(res.body.licensePlate).toEqual(carTwo.licensePlate);
    expect(res.body.id).toEqual(carTwo.id);

    carTwo.carName = newName;
  });

  it('422 failed update one car invalid parameter', async () => {
    const res = await api
      .put(`/api/car/${userId}/${carTwo.id}`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Invalid inputs');
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
