// Add database package and connection string (can remove ssl)
const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
    /*
  user: process.env.PSQL_USER,
  host: process.env.PSQL_HOST,
  database: process.env.PSQL_DATABASE,
  password: process.env.PSQL_PASSWORD, 
  port: process.env.PSQL_PORT
  */
});

console.log("Successful connection to the database");

const sql_create = `DROP TABLE IF EXISTS customer;
CREATE TABLE customer (
    cusId        SERIAL PRIMARY KEY,
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

function get3Random(items)
{
    for (i = 0; i < 3; ++i )
    {
        var rIdx = i + Math.floor( Math.random() * (items.length - i) );
        var temp = items[ i ];
        items[ i ] = items[ rIdx ];
        items[ rIdx ] = temp;
    }

    return items.slice( 0, 3 );
}

const findCustomers = ( customer, sortType ) => {
    // Will build query based on data provided from the form
    //  Use parameters to avoid sql injection

    // Declare variables
    var i = 0;
    params = [];
    sql = "SELECT * FROM customer WHERE true";

    // Check data provided and build query as necessary
    if ( customer.cusId && customer.cusId !== "") {
        params.push(parseInt(customer.cusId));
        sql += ` AND cusId = ${params[i]}`;
        i++;
    };
    if (customer.cusFname && customer.cusFname !== "") {
        params.push(`${customer.cusFname}%`);
        sql += ` AND cusFname ILIKE '${params[i]}'`;
        i++;
    };
    if ( customer.cusLname && customer.cusLname !== "") {
        params.push(`${customer.cusLname}%`);
        sql += ` AND cusLname ILIKE '${params[i]}'`;
        i++;
    };
    if ( customer.cusState && customer.cusState !== "") {
        params.push(`${customer.cusState}%`);
        sql += ` AND cusState ILIKE '${params[i]}'`;
        i++;
    };
    if ( customer.cusSalesYTD && customer.cusSalesYTD !== "") {
        params.push(parseFloat(customer.cusSalesYTD));
        sql += ` AND cusSalesYTD >= '\$${params[i]}'`;
        i++;
    };
    if ( customer.cusSalesPrev && customer.cusSalesPrev !== "") {
        params.push(parseFloat(customer.cusSalesPrev));
        sql += ` AND cusSalesPrev >= '\$${params[i]}'`;
        i++;
    };

    if( sortType == "customersByName" )
    {
        sql += ` ORDER BY cusLname, cusFname`;
    }
    else if( sortType == "customersBySales" )
    {
        sql += ` ORDER BY cusSalesYTD DESC`;
    }
    else
    {
        sql += ` ORDER BY cusId`;
    }

    // for debugging
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql)
        .then(result => {

            if( sortType == "customersRandom" )
            {
                if( result.rows.length < 3 )
                {
                    return {
                        trans: "Error",
                        result: `Error: "3 Customers not available"`
                    }
                }
                else
                {
                    //shuffle( result.rows );
                    return { 
                        trans: "success",
                        result: get3Random( result.rows )
                    }
                }
            }
            else
            {
                console.log( "Find Success!" );
                console.log( "Rows returned: " + result.rows.length );
                return { 
                    trans: "success",
                    result: result.rows
                }
            }
        })
        .catch(err => {
            console.log( "Find Error!" );
            return {
                trans: "Error",
                result: `Error: ${err.message}`
            }
        });
};

const insertCustomer = (customer) => {
    var i = 0;
    params = [];
    
    var cusIdNameStr = "";
    var cusIdIdxStr = "";

    if( customer.cusId && customer.cusId !== "" )
    {
        params.push(`${customer.cusId}`);  
        i++;

        cusIdNameStr = "cusId, ";
        cusIdIdxStr = ", $6";
    }

    params.push(`${customer.cusFname}`);  
    i++;

    params.push(`${customer.cusLname}`);
    i++;

    if (customer.cusState !== "") {
        params.push(`${customer.cusState}`);
    }
    else
    {
        params.push(``);
    }
    i++;
    
    if (customer.cusSalesYTD !== "") {
        customer.cusSalesYTD = customer.cusSalesYTD.replace('$', '');
        customer.cusSalesYTD = customer.cusSalesYTD.replace(',', '');
        params.push( "$" + parseFloat(customer.cusSalesYTD) );
    }
    else
    {
        params.push( "$0.00" );
    }
    i++;

    if (customer.cusSalesPrev !== "") {
        customer.cusSalesPrev = customer.cusSalesPrev.replace('$', '');
        customer.cusSalesPrev = customer.cusSalesPrev.replace(',', '');
        params.push( "$" + parseFloat(customer.cusSalesPrev) );
    }
    else
    {
        params.push( "$0.00" );
    }
    i++;
    
    const sql = `INSERT INTO customer (${cusIdNameStr}cusFname, cusLname, cusState, cusSalesYTD, cusSalesPrev)
                 VALUES ($1, $2, $3, $4, $5${cusIdIdxStr})`;

                 
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                result: `customer ${customer.cusFname} ${customer.cusLname} successfully inserted`
            };
        })
        .catch(err => {
            return {
                trans: "error", 
                result: `Error on insert of customer ${customer.cusFname} ${customer.cusLname}.  ${err.message}`
            };
        });
};


const updateCustomer = (customer) => {
    var i = 0;
    params = [];
    
    params.push(`${customer.cusId}`);  
    i++;

    params.push(`${customer.cusFname}`);  
    i++;

    params.push(`${customer.cusLname}`);
    i++;

    if (customer.cusState !== "") {
        params.push(`${customer.cusState}`);
    }
    else
    {
        params.push(``);
    }
    i++;
    
    if (customer.cusSalesYTD !== "") {
        params.push( "$" + parseFloat(customer.cusSalesYTD) );
    }
    else
    {
        params.push( "$0.00" );
    }
    i++;

    if (customer.cusSalesPrev !== "") {
        params.push( "$" + parseFloat(customer.cusSalesPrev) );
    }
    else
    {
        params.push( "$0.00" );
    }
    i++;
    
    const sql = `UPDATE customer
                SET cusFname = $2,
                    cusLname = $3,
                    cusState = $4,
                    cusSalesYTD = $5,
                    cusSalesPrev = $6
                WHERE cusId = $1`;

                 
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                result: `customer ${params[0]} ${params[1]} successfully updated`
            };
        })
        .catch(err => {
            return {
                trans: "error", 
                result: `Error on update of customer ${params[0]} ${params[1]}.  ${err.message}`
            };
        });
};


const deleteCustomer = (customer) => {
    var i = 0;
    params = [];
    params.push(`${customer.cusId}`);  
    i++;

    const sql = `DELETE FROM customer
                WHERE cusId = $1`;

                 
     console.log("sql: " + sql);
     console.log("params: " + params);

    return pool.query(sql, params)
        .then(res => {
            return {
                trans: "success", 
                result: `customer ${params[0]} successfully deleted`
            };
        })
        .catch(err => {
            return {
                trans: "error", 
                result: `Error on delete of customer ${params[0]}.  ${err.message}`
            };
        });
};

module.exports.getTotalRecords = getTotalRecords;
module.exports.findCustomers = findCustomers;
module.exports.insertCustomer = insertCustomer;
module.exports.updateCustomer = updateCustomer;
module.exports.deleteCustomer = deleteCustomer;