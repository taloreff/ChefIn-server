import request from "supertest";
import { app, init } from "../app";
import mongoose from "mongoose";
import User from "../models/userModel";

export type TestUser = {
  _id?: string,
  email: string,
  password: string,
  username: string,
  accessToken?: string,
  refreshToken?: string
}

const user: TestUser = {
  email: "test@test.com",
  password: "1234",
  username: "test",
}

beforeAll(async () => {
  await init();
  await User.deleteMany({ email: user.email });
});

afterAll(async () => {
  await mongoose.connection.close();
});

describe("Auth Tests", () => {
  test("Register", async () => {
    const res = await request(app).post("/api/auth/register").send(user);
    user._id = res.body.user._id;
    expect(res.statusCode).toEqual(200);
  });

  test("Login", async () => {
    const res = await request(app).post("/api/auth/login").send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    user.accessToken = res.body.accessToken;
    user.refreshToken = res.body.refreshToken;
  });

  test("Middleware", async () => {
    const res = await request(app).get("/api/user").send();
    expect(res.statusCode).not.toEqual(200);

    const res2 = await request(app).get("/api/user").set("Authorization", "Bearer " + user.accessToken).send();
    expect(res2.statusCode).toEqual(200);

  });

  jest.setTimeout(10000);

  test("Refresh Token", async () => {
    await new Promise(r => setTimeout(r, 6000)); 
    const res = await request(app).get("/api/user").set("Authorization", "Bearer " + user.accessToken).send();
    expect(res.statusCode).not.toEqual(200);

    const res2 = await request(app).post("/api/auth/refresh")
      .send({ refreshToken: user.refreshToken });
    expect(res2.statusCode).toEqual(200);
    expect(res2.body).toHaveProperty("accessToken");
    expect(res2.body).toHaveProperty("refreshToken");
    user.accessToken = res2.body.accessToken;
    user.refreshToken = res2.body.refreshToken;

    const res3 = await request(app).get("/api/user").set("Authorization", "Bearer " + user.accessToken).send();
    expect(res3.statusCode).toEqual(200);

  });

  test("Logout", async () => {
    const res = await request(app).post("/api/auth/login").send(user);
    expect(res.statusCode).toEqual(200);
    expect(res.body).toHaveProperty("accessToken");
    expect(res.body).toHaveProperty("refreshToken");
    user.accessToken = res.body.accessToken;
    user.refreshToken = res.body.refreshToken;

    const res2 = await request(app).post("/api/auth/logout")
      .send({ refreshToken: user.refreshToken });
    expect(res2.statusCode).toEqual(200);

    const res3 = await request(app).post("/api/auth/refresh")
      .send({ refreshToken: user.refreshToken });
    expect(res3.statusCode).not.toEqual(200);
  });
});
