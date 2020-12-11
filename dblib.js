// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD, 
  port: process.env.PSQL_PORT
});

console.log("Successful connection to the database");

const sql_create = `DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
    cusId        INTEGER PRIMARY KEY,
    cusFname     VARCHAR(20) NOT NULL,
	cusLname     VARCHAR(30) NOT NULL,
	cusState     CHAR(2),
	cusSalesYTD  MONEY,
	cusSalesPrev MONEY
);`;

pool.query(sql_create, [], (err, result) => {
  if (err) {
    return console.error(err.message);
  }
  console.log("Successful creation of the 'customer' table");

  // Database seeding
  const sql_insert = `INSERT INTO customer (cusId, cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
  VALUES 
      (101, 'Alfred', 'Alexander', 'NV', 1500, 900),
      (102, 'Cynthia', 'Chase', 'CA', 900, 1200),
      (103, 'Ernie', 'Ellis', 'CA', 3500, 4000),
      (104, 'Hubert', 'Hughes', 'CA', 4500, 2000),
      (105, 'Kathryn', 'King', 'NV', 850, 500),
      (106, 'Nicholas', 'Niles', 'NV', 500, 400),
      (107, 'Patricia', 'Pullman', 'AZ', 1000, 1100),
      (108, 'Sally', 'Smith', 'NV', 1000, 1100),
      (109, 'Shelly', 'Smith', 'NV', 2500, 0),
      (110, 'Terrance', 'Thomson', 'CA', 5000, 6000),
      (111, 'Valarie', 'Vega', 'AZ', 0, 3000),
      (112, 'Xavier', 'Xerox', 'AZ', 600, 250);`;
  pool.query(sql_insert, [], (err, result) => {
    if (err) {
      return console.error(err.message);
    }
  });
});

const getTotalRecords = () => {
    sql = "SELECT COUNT(*) FROM customer";
    return pool.query(sql)
        .then(result => {
            return {
                msg: "success",
                totRecords: result.rows[0].count
            }
        })
        .catch(err => {
            return {
                msg: `Error: ${err.message}`
            }
        });
};

const findCustomers = (customer) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 0;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if (customer.cusId !== "") {
        params.push(parseInt(customer.cusId));
        sql += ` AND cusId = ${params[i]}`;
        i++;
    };
    if (customer.cusFname !== "") {
        params.push(`${customer.cusFname}%`);
        sql += ` AND cusFname ILIKE '${params[i]}'`;
        i++;
    };
    if (customer.cusLname !== "") {
        params.push(`${customer.cusLname}%`);
        sql += ` AND cusLname ILIKE '${params[i]}'`;
        i++;
    };
    if (customer.cusState !== "") {
        params.push(`${customer.cusState}%`);
        sql += ` AND cusState ILIKE '${params[i]}'`;
        i++;
    };
    if (customer.cusSalesYTD !== "") {
        params.push(parseFloat(customer.cusSalesYTD));
        sql += ` AND cusSalesYTD >= '\$${params[i]}'`;
        i++;
    };
    if (customer.cusSalesPrev !== "") {
        params.push(parseFloat(customer.cusSalesPrev));
        sql += ` AND cusSalesPrev >= '\$${params[i]}'`;
        i++;
    };

    sql += ` ORDER BY cusId`;
    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql)
        .then(result => {
            return { 
                trans: "success",
                result: result.rows
            }
        })
        .catch(err => {
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;