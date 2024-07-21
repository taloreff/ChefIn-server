// post.test.ts

import request from 'supertest';
import { app, init } from '../app';
import mongoose from 'mongoose';
import Post from '../models/postModel';
import User from '../models/userModel';
import { TestUser } from './auth.test'; // Assuming you have this type exported from auth.test

let user: TestUser = {
  email: 'test@test.com',
  password: '1234',
  username: 'test',
};

let postId: string;

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

describe('Post API Tests', () => {
  test('Create Post', async () => {
    const postPayload = {
      title: 'test title',
      description: 'test description',
      image: 'https://res.cloudinary.com/dd7nwvjli/image/upload/v1720018587/grilled_prawns_private_chef_chicago_re4abh.jpg',
      labels: ['test'],
      reviews: [
        {
          user: 'Alice Johnson',
          rating: 5,
          comment: 'Amazing food and great service!',
        },
      ],
      overview: 'test overview',
      whatsIncluded: ['test whatsincluded'],
      meetingPoint: {
        address: 'test address',
        lat: 41.8781,
        lng: -87.6298,
      },
    };

    const res = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(postPayload);
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    postId = res.body._id;
  });

  test('Get Post by ID', async () => {
    const res = await request(app)
      .get(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body._id).toEqual(postId);
  });

  test('Get My Posts', async () => {
    const res = await request(app)
      .get('/api/post/myposts')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);
    expect(res.body[0]).toHaveProperty('userId');
    expect(res.body[0].userId).toEqual(user._id);
  });

  test('Update Post', async () => {
    const updatePayload = {
      _id: postId,
      title: 'updated title',
      description: 'updated description',
      image: 'https://res.cloudinary.com/dd7nwvjli/image/upload/v1720018587/grilled_prawns_private_chef_chicago_re4abh.jpg',
      labels: ['updated'],
      reviews: [
        {
          user: 'Alice Johnson',
          rating: 4,
          comment: 'Updated review comment!',
        },
      ],
      overview: 'updated overview',
      whatsIncluded: ['updated whatsincluded'],
      meetingPoint: {
        address: 'updated address',
        lat: 41.8781,
        lng: -87.6298,
      },
    };

    const res = await request(app)
      .put(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(updatePayload);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.title).toEqual('updated title');
  });

  test('Delete Post', async () => {
    const res = await request(app)
      .delete(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(200);

    const getRes = await request(app)
      .get(`/api/post/${postId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(getRes.statusCode).toEqual(404);
  });
});