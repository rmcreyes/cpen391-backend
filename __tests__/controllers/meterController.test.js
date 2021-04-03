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

  it('200 no meter, no meter status', async () => {
    const res = await api
      .get(`/api/meter/all`);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('No meter found');
  });

  const newMeter = {
    unitPrice: 12,
  };
  const anotherMeter = {
    unitPrice: 21
  }
  it('201 add meter', async () => {
    let res = await api.post('/api/meter/addMeter').send(newMeter);

    expect(res.statusCode).toEqual(201);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toBeTruthy();

    newMeter.id = res.body.id;

    res = await api.post('/api/meter/addMeter').send(anotherMeter);

    expect(res.statusCode).toEqual(201);
    expect(res.body.unitPrice).toEqual(anotherMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toBeTruthy();

    anotherMeter.id = res.body.id;
  });

  it('200 get meter status', async () => {
    const res = await api.get(`/api/meter/${newMeter.id}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toEqual(newMeter.id);
  });

  /* === User Parking =====================================================
   */

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

  const userPayment = {
    cardNum: 987654321,
    expDate: 111,
    cvv: 333,
  };
  it('201 add payment for user', async () => {
    const res = await api
      .post(`/api/payment/user/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(userPayment);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(true);
  });

  let userCar = {
    carName: 'MY_CAR',
    licensePlate: '123ABC',
  };
  it('201 add user car', async () => {
    const res = await api
      .post(`/api/car/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(userCar);

    expect(res.statusCode).toEqual(201);
    expect(res.body.carName).toEqual(userCar.carName);
    expect(res.body.licensePlate).toEqual(userCar.licensePlate.toUpperCase());
    expect(res.body.id).toBeTruthy();
    expect(res.body.userId).toEqual(userId);

    userCar.id = res.body.id;
  });

  let parkingId;
  it('200 user isOccupied: true', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: userCar.licensePlate });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(true);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.parkingId).toBeTruthy();
    expect(res.body.isUser).toEqual(true);

    parkingId = res.body.parkingId;
  });

  it('401 meter is already occupied', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: '123123' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Error: meter is already occupied');
  });

  it('409 can not move parked car', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: '123123' });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Error: existing parked car');
  });

  it('200 isOccupied: false', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: userCar.licensePlate });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.updatedAt).toBeTruthy();
    expect(res.body.parkingId).not.toBeTruthy();
  });

  it('401 meter is not occupied', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: '123321' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Error: meter is not occupied');
  });

  /* === Guest Parking =====================================================
   */

  it('200 guest isOccupied: true', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: 'NOTNOT' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(true);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.parkingId).toBeTruthy();
    expect(res.body.updatedAt).toBeTruthy();
    expect(res.body.isUser).toEqual(false);

    parkingId = res.body.parkingId;
  });

  it('401 meter is already occupied', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: '123123' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Error: meter is already occupied');
  });

  it('409 can not move parked car', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: '123123' });

    expect(res.statusCode).toEqual(409);
    expect(res.body.message).toEqual('Error: existing parked car');
  });

  const guestPayment = {
    cardNum: 123456789,
    expDate: 999,
    cvv: 111,
  };
  it('201 add payment for guest', async () => {
    const res = await api
      .post(`/api/payment/guest/${parkingId}`)
      .send(guestPayment);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toEqual(true);
  });

  it('200 isOccupied: false', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: 'NOTNOT' });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.parkingId).not.toBeTruthy();
    expect(res.body.updatedAt).toBeTruthy();
  });

  it('401 meter is not occupied', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: false, licensePlate: '123321' });

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Error: meter is not occupied');
  });

  /* === Manual Parking =====================================================
   */

  it('200 isOccupied: true, isConfirmed: true (manual parking)', async () => {
    const res = await api
      .put(`/api/meter/${newMeter.id}`)
      .send({ isOccupied: true, licensePlate: 'NOTNOT', isConfirmed: true });

    expect(res.statusCode).toEqual(200);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(true);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.parkingId).toBeTruthy();
  });

  /* === Get all meter status =====================================================
   */
  it('200 get all meter status', async () => {
    const res = await api
      .get(`/api/meter/all`);

    expect(res.statusCode).toEqual(200);
    expect(res.body[0].id).toEqual(newMeter.id);
    expect(res.body[0].unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body[0].isOccupied).toEqual(true);
  });

  it('200 reset meter', async () => {
    const res = await api
      .post(`/api/meter/${newMeter.id}/reset`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(newMeter.id);
    expect(res.body.unitPrice).toEqual(newMeter.unitPrice);
    expect(res.body.isOccupied).toEqual(false);
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
