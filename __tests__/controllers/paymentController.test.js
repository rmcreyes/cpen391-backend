const mongoose = require('mongoose');
const supertest = require('supertest');
const http = require('http');

const app = require('../../app');

describe('Payment Tests', () => {
  let server, api;
  beforeAll(done => {
    server = http.createServer(app);
    server.listen(done);
    api = supertest(server);
  });

  let userId, token;
  const newUser = {
    firstName: 'TESTING',
    lastName: 'TESTING',
    email: 'testing@testing.com',
    password: 'TESTING',
  };
  it('201 should succeed to sign up if every input is correct', async () => {
    const res = await api.post('/api/user/signup').send(newUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.email).toEqual(newUser.email.toLowerCase());
    expect(res.body.userId).toBeTruthy();
    expect(res.body.token).toBeTruthy();

    userId = res.body.userId;
    token = res.body.token;
  });

  it('200 should get user profile', async () => {
    const res = await api
      .get('/api/user/me')
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(userId);
    expect(res.body.email).toEqual(newUser.email.toLowerCase());
    expect(res.body.paymentId).toEqual(undefined);
  });

  const userPayment = {
    cardNum: 987654321,
    expDate: 123,
    cvv: 987,
  };

  it('201 user adds payment on app', async () => {
    const res = await api
      .post(`/api/payment/user/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(userPayment);

    expect(res.statusCode).toEqual(201);
    expect(res.body).toBeTruthy();
  });

  it('200 get user profile with payment', async () => {
    const res = await api
      .get('/api/user/me')
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(userId);
    expect(res.body.email).toEqual(newUser.email.toLowerCase());
    expect(res.body.paymentId.cardNum).toEqual(userPayment.cardNum);
    expect(res.body.paymentId.expDate).toEqual(userPayment.expDate);
    expect(res.body.paymentId.cvv).toEqual(userPayment.cvv);
  });

  const newUserPayment = {
    cardNum: 123456789,
    expDate: 321,
    cvv: 789,
  };

  it('200 update user payment', async () => {
    const res = await api
      .put(`/api/payment/user/${userId}`)
      .set('Authorization', `Bear ${token}`)
      .send(newUserPayment);

    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeTruthy();
  });

  it('200 get user profile with updated payment', async () => {
    const res = await api
      .get('/api/user/me')
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(userId);
    expect(res.body.email).toEqual(newUser.email.toLowerCase());
    expect(res.body.paymentId.cardNum).toEqual(newUserPayment.cardNum);
    expect(res.body.paymentId.expDate).toEqual(newUserPayment.expDate);
    expect(res.body.paymentId.cvv).toEqual(newUserPayment.cvv);
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
