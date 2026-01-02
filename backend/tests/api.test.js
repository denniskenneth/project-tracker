const request = require("supertest");
const app = require("../app");
const { sequelize, User } = require("../models");
const bcrypt = require("bcrypt");

let userToken, adminToken, userId;

beforeAll(async () => {
  await sequelize.sync({ force: true });

  // Create normal user
  const u = await User.create({
    username: "tester",
    email: "tester@mail.com",
    password: await bcrypt.hash("Tester123!", 10),
    role: "user",
  });
  userId = u.id;

  // Create admin
  await User.create({
    username: "admin",
    email: "admin@mail.com",
    password: await bcrypt.hash("Admin123!", 10),
    role: "admin",
  });

  // Login both
  const userRes = await request(app).post("/api/auth/login").send({
    email: "tester@mail.com",
    password: "Tester123!",
  });
  userToken = userRes.body.token;

  const adminRes = await request(app).post("/api/auth/login").send({
    email: "admin@mail.com",
    password: "Admin123!",
  });
  adminToken = adminRes.body.token;
});

afterAll(async () => {
  await sequelize.close();
});

test("User can create a project", async () => {
  const res = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${userToken}`)
    .send({ title: "Proj 1", summary: "Summary", status: "Pending" });

  expect(res.statusCode).toBe(201);
  expect(res.body.title).toBe("Proj 1");
  expect(res.body.created_by).toBe(userId);
});

test("Admin can view all projects", async () => {
  const res = await request(app)
    .get("/api/projects")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(Array.isArray(res.body)).toBe(true);
  expect(res.body.length).toBeGreaterThan(0);
});

test("User sees only their own activity logs", async () => {
  const res = await request(app)
    .get("/api/activity-logs")
    .set("Authorization", `Bearer ${userToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.every((l) => l.user_id === userId)).toBe(true);
});

test("Admin sees all activity logs", async () => {
  const res = await request(app)
    .get("/api/activity-logs")
    .set("Authorization", `Bearer ${adminToken}`);

  expect(res.statusCode).toBe(200);
  expect(res.body.length).toBeGreaterThan(0);
});

test("User cannot delete another user's project", async () => {
  // create another user + project
  const otherRegister = await request(app).post("/api/auth/register").send({
    username: "other",
    email: "other@mail.com",
    password: "Other123!",
  });

  const otherLogin = await request(app).post("/api/auth/login").send({
    email: "other@mail.com",
    password: "Other123!",
  });
  const otherToken = otherLogin.body.token;

  const otherProject = await request(app)
    .post("/api/projects")
    .set("Authorization", `Bearer ${otherToken}`)
    .send({
      title: "Other Project",
      summary: "Other Summary",
      status: "Pending",
    });

  const del = await request(app)
    .delete(`/api/projects/${otherProject.body.id}`)
    .set("Authorization", `Bearer ${userToken}`);

  expect(del.statusCode).toBe(403);
});
