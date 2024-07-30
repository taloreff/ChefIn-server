import request from 'supertest';
import { app, init } from '../app';
import mongoose from 'mongoose';
import User from '../models/userModel';
import { TestUser } from './auth.test';
import nock from 'nock';
import path from "path"

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
// title, description, overview, meetingPoint, labels, whatsIncluded, reviews
describe('Post API Tests', () => {
  test('Create Post', async () => {
    const postPayload = {
      title: 'test title',
      description: 'test description',
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
      .field('title', postPayload.title)
      .field('description', postPayload.description)
      .field('labels', JSON.stringify(postPayload.labels))
      .field('reviews', JSON.stringify(postPayload.reviews))
      .field('overview', postPayload.overview)
      .field('whatsIncluded', JSON.stringify(postPayload.whatsIncluded))
      .field('meetingPoint', JSON.stringify(postPayload.meetingPoint))
      .attach('image', path.resolve(__dirname, '../../uploads/1.jpeg')); 
    expect(res.statusCode).toEqual(201);
    expect(res.body).toHaveProperty('_id');
    postId = res.body._id;
  });

  test('Create Post with Invalid Data', async () => {
    const invalidPost = { /* missing required fields */ };
    const res = await request(app)
      .post('/api/post')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(invalidPost);
    expect(res.statusCode).toEqual(500); 

  });
  
  test('Get Non-existent Post', async () => {
    const fakeId = '5f8d0f5d7925b53e6b6f0f0f'; // A non-existent ID
    const res = await request(app)
      .get(`/api/post/${fakeId}`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(404);

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

  test('Get All Posts', async () => {
    const res = await request(app)
      .get('/api/post')
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send();
    expect(res.statusCode).toEqual(200);
    expect(res.body).toBeInstanceOf(Array);

  });

  test('Add Review to Post', async () => {
    const reviewPayload = {
      rating: 4,
      comment: 'Great food!',
    };

    const res = await request(app)
      .put(`/api/post/${postId}/review`)
      .set('Authorization', `Bearer ${user.accessToken}`)
      .send(reviewPayload);
    expect(res.statusCode).toEqual(200);
    expect(res.body.reviews).toBeInstanceOf(Array);
    expect(res.body.reviews[res.body.reviews.length - 1]).toHaveProperty('rating', 4);
    expect(res.body.reviews[res.body.reviews.length - 1]).toHaveProperty('comment', 'Great food!');

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

  // test('Get Place Details', async () => {
  //   const scope = nock('https://maps.googleapis.com')
  //     .get('/maps/api/place/details/json')
  //     .query({ placeid: 'ChIJN1t_tDeuEmsRUsoyG83frY4', key: process.env.GOOGLE_API_KEY })
  //     .reply(200, { result: { name: 'Test Place', formatted_address: '123 Test St' } });

  //   const res = await request(app)
  //     .get('/api/post/place-details')
  //     .query({ placeId: 'ChIJN1t_tDeuEmsRUsoyG83frY4' })
  //     .set('Authorization', `Bearer ${user.accessToken}`)
  //     .send();
  //   expect(res.statusCode).toEqual(200);
  //   expect(res.body).toHaveProperty('result');
  // })
});