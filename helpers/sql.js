"use strict";

const { BadRequestError } = require("../expressError");

/** Input:
 * dataToUpdate which can include: { firstName, lastName, password, email, isAdmin }
 * jsToSql: which is an object that maps camelCase to snake_case for SQL cols
 *      {
          numEmployees: "num_employees",
          logoUrl: "logo_url",
        }
 *
 * Returns {setCols: "first_name=$1, age=$2", values: ["Aliya", 32]}
 *
 */

function sqlForPartialUpdate(dataToUpdate, jsToSql) {
  const keys = Object.keys(dataToUpdate);
  if (keys.length === 0) throw new BadRequestError("No data");

  // {firstName: 'Aliya', age: 32} => ['"first_name"=$1', '"age"=$2']
  const cols = keys.map((colName, idx) =>
    `"${jsToSql[colName] || colName}"=$${idx + 1}`,
  );

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}



/** sqlForWhereFilter: input could include: {nameLike, minEmployees, maxEmployees}
 *
 * Returns SQL for a WHERE clause "name ILIKE %bob% AND num_employees >= 10"
  */

function sqlForWhereFilter(params) {
  const clauses = [];

  if (params.minEmployees > params.maxEmployees) {
    throw new BadRequestError("minEmployees cannot be greater than maxEmployees");
  }

  for (const key in params) {
    if (key === "nameLike") {
      clauses.push(`name ILIKE '%${params[key]}%'`);
    } else if (key === "minEmployees") {
      clauses.push(`num_employees >= ${params[key]}`);
    } else if (key === "maxEmployees") {
      clauses.push(`num_employees <= ${params[key]}`);
    } else {
      throw new BadRequestError("Invalid filtering fields");
    }
  }

  return clauses.join(' AND ')
}

module.exports = { sqlForPartialUpdate, sqlForWhereFilter };
