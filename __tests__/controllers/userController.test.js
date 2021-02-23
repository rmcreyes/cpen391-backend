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

  it('422 should fail to sign up if inputs are invalid', async () => {
    const newUser = {
      firstName: 'TESTING',
      email: 'invalid_email',
      password: 'TESTING',
    };

    const res = await api.post('/api/user/signup').send(newUser);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Invalid inputs');
  });

  it('422 sign up fail too many parameters', async () => {
    const newUser = {
      firstName: 'TESTING',
      lastName: "TESTING",
      email: 'invalid_email',
      password: 'TESTING',
      something: "something",
      something: "something",
      something: "something",
      something: "something"
    };

    const res = await api.post('/api/user/signup').send(newUser);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('Invalid inputs');
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

  it('422 should fail to sign up if the user has existed', async () => {
    const existingUser = {
      firstName: 'TESTING',
      lastName: 'TESTING',
      email: 'testing@testing.com',
      password: 'TESTING',
    };

    const res = await api.post('/api/user/signup').send(existingUser);

    expect(res.statusCode).toEqual(422);
    expect(res.body.message).toEqual('User exists already, please login');
  });

  it('200 should succeed to login for an existing user', async () => {
    const loginInfo = {
      email: 'testing@testing.com',
      password: 'TESTING',
    };

    const res = await api.post('/api/user/login').send(loginInfo);

    expect(res.statusCode).toEqual(200);
    expect(res.body.userId).toBeTruthy();
    expect(res.body.email).toEqual(loginInfo.email);
    expect(res.body.token).toBeTruthy();

    token = res.body.token;
  });

  it('401 should fail to login if the user does not exist', async () => {
    const loginInfo = {
      email: 'NEW@NEW.com',
      password: 'NEW_PASSWORD',
    };

    const res = await api.post('/api/user/login').send(loginInfo);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('401 missing login info', async () => {
    const loginInfo = {
      email: '',
      password: '',
    };

    const res = await api.post('/api/user/login').send(loginInfo);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('401 should fail to login if the password is invalid', async () => {
    const loginInfo = {
      email: 'testing@testing.com',
      password: 'WRONG_PASSWORD',
    };

    const res = await api.post('/api/user/login').send(loginInfo);

    expect(res.statusCode).toEqual(401);
    expect(res.body.message).toEqual('Invalid credentials');
  });

  it('200 should get user profile', async () => {
    const res = await api
      .get('/api/user/me')
      .set('Authorization', `Bear ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.id).toEqual(userId);
    expect(res.body.email).toEqual('testing@testing.com');
  });

  afterAll(async done => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
    server.close(done);
  });
});
