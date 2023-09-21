"use strict";

const { sqlForPartialUpdate, sqlForWhereFilter } = require("./sql");


describe("sqlForPartialUpdate", function () {
  test("valid input", function () {
    const result = sqlForPartialUpdate(
      { firstName: "Test", email: "test@email.com" }, { firstName: "first_name" });

    expect(result).toEqual({
      setCols: "\"first_name\"=$1, \"email\"=$2",
      values: ["Test", "test@email.com"]
    });
  });

  test("no data sent", function () {
    expect(() => sqlForPartialUpdate({}, {})).toThrow("No data");
  });
});
// could test 1 and 2 properties

