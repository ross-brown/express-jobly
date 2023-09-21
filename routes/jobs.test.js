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
      id: 4,
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

/************************************** GET /companies */

describe("GET /jobs", function (){

  test("ok for get all jobs", async function(){
    const resp = await request(app).get("/jobs");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({jobs : [
      {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "j2",
        salary: 50000,
        equity: "0.75",
        companyHandle: "c2",
      },
      {
        id: 3,
        title: "j3",
        salary: 25000,
        equity: "0.9",
        companyHandle: "c3",
      },
    ]});

  })
})
