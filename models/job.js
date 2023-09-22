"use strict";

const db = require("../db");
const { NotFoundError, BadRequestError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
  /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, company_handle }
   *
   * Returns { id, title, salary, equity, company_handle }
   *
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const handleCheck = await db.query(`
      SELECT handle
        FROM companies
        WHERE handle = $1`, [companyHandle]);

    if (!handleCheck.rows[0]) throw new BadRequestError(
      `companyHandle ${companyHandle} does not exist`);


    const result = await db.query(`
                INSERT INTO jobs (title,
                                       salary,
                                       equity,
                                       company_handle)
                VALUES ($1, $2, $3, $4)
                RETURNING
                    id,
                    title,
                    salary,
                    equity,
                    company_handle AS "companyHandle"`, [
      title,
      salary,
      equity,
      companyHandle,
    ],
    );
    const job = result.rows[0];

    return job;
  }

  /** Find all jobs with optional filtering from querystring.
   *
   *
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll(queryString = {}) {
    //TODO: after todo from sqlforwhere, dont need lines 54 - 56 / line 65, be cautious with ?.
    let whereClauseObj;

    if (queryString?.title || queryString?.minSalary || queryString?.hasEquity) {
      whereClauseObj = Job.sqlForWhereFilter(queryString);
    }

    const jobsRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        ${whereClauseObj?.filterCols || ''}
        ORDER BY title`, whereClauseObj?.values);

    return jobsRes.rows;
  }

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(`
        SELECT id,
               title,
               salary,
               equity,
               company_handle AS "companyHandle"
        FROM jobs
        WHERE id = $1`, [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Update job with `data`.
   *
   * This is a "partial update" --- it's fine if data doesn't contain all the
   * fields; this only changes provided ones.
   *
   * Data can include: { title, salary, equity }
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   */

  static async update(id, data) {
    const { setCols, values } = sqlForPartialUpdate(
      data,
      {
        companyHandle: "company_handle"
      });
    const idVarIdx = "$" + (values.length + 1);

    const querySql = `
        UPDATE jobs
        SET ${setCols}
        WHERE id = ${idVarIdx}
        RETURNING
            id,
            title,
            salary,
            equity,
            company_handle AS "companyHandle"`;
    const result = await db.query(querySql, [...values, id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);

    return job;
  }

  /** Delete given job from database; returns undefined.
   *
   * Throws NotFoundError if job not found.
   **/

  static async remove(id) {
    const result = await db.query(`
        DELETE
        FROM jobs
        WHERE id = $1
        RETURNING id`, [id]);
    const job = result.rows[0];

    if (!job) throw new NotFoundError(`No job: ${id}`);
  }


  /** sqlForWhereFilter: input could include: {title, minSalary, hasEquity}
   *
   * Returns {filterCols, values}
   */

  static sqlForWhereFilter(queryString) {
    const keys = Object.keys(queryString);
    const cols = [];
    const values = [];

    for (let i = 0; i < keys.length; i++) {
      if (keys[i] === 'title') {
        values.push(queryString[keys[i]]);
        cols.push(`title ILIKE '%' || $${values.length} || '%'`);
      } else if (keys[i] === 'minSalary') {
        values.push(queryString[keys[i]]);
        cols.push(`salary >= $${values.length}`);
      } else if (keys[i] === 'hasEquity' && queryString[keys[i]] === true) {
        cols.push(`equity IS NOT NULL`);
      }
    }

    return {
      filterCols: cols.length === 0 ? '' : "WHERE " + cols.join(" AND "),
      values
    };
  }
}


module.exports = Job;
