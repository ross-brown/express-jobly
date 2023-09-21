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
  };

  test("ok for admins", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send(newJob)
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: 4,
        title: "test title",
        salary: 100000,
        equity: "0.09",
        companyHandle: 'c1'
      }
    });
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

describe("GET /jobs", function () {

  test("ok for get all jobs", async function () {
    const resp = await request(app).get("/jobs");

    expect(resp.statusCode).toEqual(200);
    expect(resp.body).toEqual({
      jobs: [
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
      ]
    });

  });
});

// test("test query string filter works ok", async function () {
//   const resp = await request(app).get("/companies").query({
//     nameLike: "c",
//     minEmployees: 1,
//     maxEmployees: 2
//   });
//   expect(resp.body).toEqual({
//     companies:
//       [
//         {
//           handle: "c1",
//           name: "C1",
//           description: "Desc1",
//           numEmployees: 1,
//           logoUrl: "http://c1.img",
//         },
//         {
//           handle: "c2",
//           name: "C2",
//           description: "Desc2",
//           numEmployees: 2,
//           logoUrl: "http://c2.img",
//         }
//       ],
//   });
// });

// test("test query string incorrect keys", async function () {
//   const resp = await request(app).get("/companies").query({
//     username: "c",
//     numScoops: 1,
//     maxEmployees: 2
//   });
//   expect(resp.body).toEqual({
//     "error": {
//       "message": [
//         "instance is not allowed to have the additional property \"username\"",
//         "instance is not allowed to have the additional property \"numScoops\"",
//       ],
//       "status": 400,
//     }
//   });
// });

// test("test query string min > max", async function () {
//   const resp = await request(app).get("/companies").query({
//     nameLike: "c",
//     minEmployees: 3,
//     maxEmployees: 2
//   });
//   expect(resp.body).toEqual({
//     "error": {
//       "message": "minEmployees cannot be greater than maxEmployees",
//       "status": 400,
//     },
//   });
// });


/************************************** GET /jobs/:id */

describe("GET /jobs/:id", function () {
  test("works for anon", async function () {
    const resp = await request(app).get(`/jobs/1`);
    expect(resp.body).toEqual({
      job: {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: "0.5",
        companyHandle: "c1",
      }
    });
  });

  test("not found for no such job", async function () {
    const resp = await request(app).get(`/jobs/-159`);
    expect(resp.statusCode).toEqual(404);
  });
});

/************************************** PATCH /jobs/:id */

describe("PATCH /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "new job title",
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.body).toEqual({
      job: {
        companyHandle: "c1",
        equity: "0.5",
        id: 1,
        salary: 100000,
        title: "new job title",
      },
    });
  });

  test("unauth for non-admin user", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: "new job title",
      })
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        name: "new job title",
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("not found on no such job", async function () {
    const resp = await request(app)
      .patch(`/jobs/-100`)
      .send({
        title: "new nope",
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });

  test("bad request on company handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        companyHandle: "c2",
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid salary", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        logoUrl: "not a salary",
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid title", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        title: 1234,
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });

  test("bad request on invalid job property", async function () {
    const resp = await request(app)
      .patch(`/jobs/1`)
      .send({
        numScoops: 1,
      })
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(400);
  });
});


/************************************** DELETE /jobs/:id */

describe("DELETE /jobs/:id", function () {
  test("works for admins", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.body).toEqual({ deleted: "1" });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("unauth for non-admin users", async function () {
    const resp = await request(app)
      .delete(`/jobs/1`)
      .set("authorization", `Bearer ${u1Token}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("not found for no such job", async function () {
    const resp = await request(app)
      .delete(`/jobs/-100`)
      .set("authorization", `Bearer ${u2AdminToken}`);
    expect(resp.statusCode).toEqual(404);
  });
});
