const mongoose = require('mongoose');
const supertest = require('supertest');
const http = require('http');

const app = require('../../app');
const parking = require('../../models/parking');

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
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toBeTruthy();

    newMeter.id = res.body.id;
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

  /* ====================================================================================================================================================
   */

  it('404 get current parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/current`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found any current previous');
  });

  it('404 get previous parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/previous`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found any current previous');
  });

  it('404 get all parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/all`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found any parked');
  });

  /* ====================================================================================================================================================
   */

  let parkingId;
  it('200 isOccupied: true', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: carOne.licensePlate });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(true);
    expect(res.body.parkingId).toBeTruthy();
    expect(res.body.id).toEqual(newMeter.id);

    parkingId = res.body.parkingId;
  });

  it('200 confirmed', async () => {
    const res = await api
      .put(`/api/parking/confirm/${parkingId}`)
      .send({ isNew: false, licensePlate: carOne.licensePlate });

    expect(res.statusCode).toEqual(200);
    expect(res.body.parkingId).toEqual(parkingId);
  });

  it('200 get current parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/current`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.currentParkings).toBeTruthy();

    const currentParkings = res.body.currentParkings;
    expect(currentParkings.length).toEqual(1);
    expect(currentParkings[0].isParked).toEqual(true);
    expect(currentParkings[0].paid).toEqual(false);
    expect(currentParkings[0].licensePlate).toEqual(carOne.licensePlate);
    expect(currentParkings[0].userId).toEqual(userId);
    expect(currentParkings[0].carId).toEqual(carOne.id);
    expect(currentParkings[0].meterId).toEqual(newMeter.id);
    expect(currentParkings[0].unitPrice).toEqual(newMeter.unitPrice);
    expect(currentParkings[0].startTime).toBeTruthy();
    expect({ cost: expect.any(Number) }).toEqual(
      expect.not.objectContaining(currentParkings[0])
    );
  });

  it('404 get previous parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/previous`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found any current previous');
  });

  it('200 get all parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/all`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.allParkings).toBeTruthy();

    const allParkings = res.body.allParkings;
    expect(allParkings.length).toEqual(1);
    expect(allParkings[0].isParked).toEqual(true);
    expect(allParkings[0].paid).toEqual(false);
    expect(allParkings[0].licensePlate).toEqual(carOne.licensePlate);
    expect(allParkings[0].userId).toEqual(userId);
    expect(allParkings[0].carId).toEqual(carOne.id);
    expect(allParkings[0].meterId).toEqual(newMeter.id);
    expect(allParkings[0].unitPrice).toEqual(newMeter.unitPrice);
    expect(allParkings[0].startTime).toBeTruthy();
    expect({ cost: expect.any(Number) }).toEqual(
      expect.not.objectContaining(allParkings[0])
    );
  });

  /* ====================================================================================================================================================
   */

  it('200 isOccupied: false', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: carOne.licensePlate });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toEqual(newMeter.id);
  });

  it('404 get current parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/current`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(404);
    expect(res.body.message).toEqual('Not found any current previous');
  });

  it('200 get previous parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/previous`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.previousParkings).toBeTruthy();

    const previousParkings = res.body.previousParkings;
    expect(previousParkings.length).toEqual(1);
    expect(previousParkings[0].isParked).toEqual(false);
    expect(previousParkings[0].paid).toEqual(false);
    expect(previousParkings[0].licensePlate).toEqual(carOne.licensePlate);
    expect(previousParkings[0].userId).toEqual(userId);
    expect(previousParkings[0].carId).toEqual(carOne.id);
    expect(previousParkings[0].meterId).toEqual(newMeter.id);
    expect(previousParkings[0].unitPrice).toEqual(newMeter.unitPrice);
    expect(previousParkings[0].startTime).toBeTruthy();
    expect(previousParkings[0].cost).toBeTruthy();
  });

  it('200 get all parkings', async () => {
    const res = await api
      .get(`/api/parking/${userId}/all`)
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.allParkings).toBeTruthy();

    const allParkings = res.body.allParkings;
    expect(allParkings.length).toEqual(1);
    expect(allParkings[0].isParked).toEqual(false);
    expect(allParkings[0].paid).toEqual(false);
    expect(allParkings[0].licensePlate).toEqual(carOne.licensePlate);
    expect(allParkings[0].userId).toEqual(userId);
    expect(allParkings[0].carId).toEqual(carOne.id);
    expect(allParkings[0].meterId).toEqual(newMeter.id);
    expect(allParkings[0].unitPrice).toEqual(newMeter.unitPrice);
    expect(allParkings[0].startTime).toBeTruthy();
    expect(allParkings[0].cost).toBeTruthy();
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
