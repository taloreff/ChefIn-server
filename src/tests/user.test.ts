import request from 'supertest';
import { app, init } from '../app';
import mongoose from 'mongoose';
import User from '../models/userModel';

type TestUser = {
  _id?: string,
  email: string,
  password: string,
  username: string,
  accessToken?: string,
  refreshToken?: string
};

let user: TestUser = {
  email: 'testuser@test.com',
  password: '1234',
  username: 'testuser',
};

beforeAll(async () => {
  await init();
  await User.deleteMany({ email: user.email });
  const registerRes = await request(app).post('/api/auth/register').send(user);
  user._id = registerRes.body.user._id;
  user.accessToken = registerRes.body.accessToken;
  user.refreshToken = registerRes.body.refreshToken;
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe('User API Tests', () => {
  test('Get User', async () => {
    const res = await request(app)
      .get(`/api/user/${user._id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('email', user.email);
    expect(res.body).toHaveProperty('username', user.username);
  });

  test('Update User', async () => {
    const updatedUser = {
      ...user,
      username: 'updateduser',
    };

    const res = await request(app)
      .put(`/api/user/${user._id}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(updatedUser);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('username', updatedUser.username);

    // Update user object for further tests
    user.email = updatedUser.email;
    user.username = updatedUser.username;
  });
});