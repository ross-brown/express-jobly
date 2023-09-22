"use strict";

const db = require("../db.js");
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require("./job.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


/************************************** create */

describe("create", function () {
  const newJob = {
    title: "engineer",
    salary: 90000,
    equity: 0,
    companyHandle: 'c1'
  };

  const invalidJob = {
    title: "engineer",
    salary: 90000,
    equity: 0,
    companyHandle: 'sdajkfldhsa'
  };

  test("works", async function () {
    let job = await Job.create(newJob);
    expect(job).toEqual({
      id: job.id,
      title: "engineer",
      salary: 90000,
      equity: "0",
      companyHandle: 'c1'
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = ${job.id}`);
    expect(result.rows).toEqual([
      {
        id: job.id,
        title: "engineer",
        salary: 90000,
        equity: "0",
        company_handle: "c1",
      },
    ]);
  });

  test("invalid company handle", async function () {
    try {
      await Job.create(invalidJob);
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});


/************************************** findAll */

describe("findAll", function () {
  test("works: no filter", async function () {
    let jobs = await Job.findAll();
    expect(jobs).toEqual([
      {
        id: 1,
        title: "j1",
        salary: 100000,
        equity: "0",
        companyHandle: "c1",
      },
      {
        id: 2,
        title: "j2",
        salary: 80000,
        equity: "0.099",
        companyHandle: "c2",
      },
      {
        id: 3,
        title: "j3",
        salary: 70000,
        equity: null,
        companyHandle: "c3",
      },
      {
        id: 4,
        title: "j4",
        salary: 9000,
        equity: null,
        companyHandle: "c1",
      },
    ]);
  });

  test("works: with filter", async function () {
    const jobs = await Job.findAll({ title: "j", minSalary: 20000 });
    expect(jobs).toEqual([
      {
        companyHandle: "c1",
        equity: "0",
        id: 1,
        salary: 100000,
        title: "j1",
      },
      {
        companyHandle: "c2",
        equity: "0.099",
        id: 2,
        salary: 80000,
        title: "j2",
      },
      {
        companyHandle: "c3",
        equity: null,
        id: 3,
        salary: 70000,
        title: "j3",
      },
    ]);
  });

  test("works: with all filters", async function () {
    const companies = await Job.findAll({ title: "j", minSalary: 80000, hasEquity: true });
    expect(companies).toEqual([
      {
        companyHandle: "c1",
        equity: "0",
        id: 1,
        salary: 100000,
        title: "j1",
      },
      {
        companyHandle: "c2",
        equity: "0.099",
        id: 2,
        salary: 80000,
        title: "j2",
      },
    ]);
  });
});

/************************************** get */

describe("get", function () {
  test("works", async function () {
    let job = await Job.get(1);
    expect(job).toEqual({
      id: 1,
      title: "j1",
      salary: 100000,
      equity: "0",
      companyHandle: "c1",
    });
  });

  test("not found if no such job", async function () {
    try {
      await Job.get(-159);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe("update", function () {
  const updateData = {
    title: "new title",
    salary: 10,
    equity: 0.75,
  };

  test("works", async function () {
    let job = await Job.update(1, updateData);
    expect(job).toEqual({
      id: 1,
      title: "new title",
      salary: 10,
      equity: "0.75",
      companyHandle: 'c1'
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "new title",
      salary: 10,
      equity: "0.75",
      company_handle: "c1",
    }]);
  });

  test("works: null fields", async function () {
    const updateDataSetNulls = {
      title: "new title",
      salary: null,
      equity: null,
    };

    let job = await Job.update(1, updateDataSetNulls);
    expect(job).toEqual({
      id: 1,
      ...updateDataSetNulls,
      companyHandle: 'c1'
    });

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = 1`);
    expect(result.rows).toEqual([{
      id: 1,
      title: "new title",
      salary: null,
      equity: null,
      company_handle: 'c1'
    }]);
  });

  test("not found if no such company", async function () {
    try {
      await Job.update(-159, updateData);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    try {
      await Job.update(1, {});
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe("remove", function () {
  test("works", async function () {
    await Job.remove(1);
    const res = await db.query(
      "SELECT id FROM jobs WHERE id=1");
    expect(res.rows.length).toEqual(0);
  });

  test("not found if no such company", async function () {
    try {
      await Job.remove(-159);
      throw new Error("fail test, you shouldn't get here");
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});
