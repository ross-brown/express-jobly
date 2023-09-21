"use strict";

const request = require("supertest");

const db = require("../db");
const app = require("../app");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  u2AdminToken
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/*************************************** POST /jobs */

describe("POST /jobs", function () {
  const newJob = {
    title: "test title",
    salary: 100000,
    equity: 0.09,
    companyHandle: 'c1'
  }

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({job: {
      id: expect.any(Number), // we have ALTER SEQUENCE but not working...
      title: "test title",
      salary: 100000,
      equity: "0.09",
      companyHandle: 'c1'
    }});
  });

  test("invalid data sent", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        numScoops: 4,
        salary: "LOL"
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

});
