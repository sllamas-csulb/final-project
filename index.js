// Add required packages
const express = require("express");
const app = express();
const fileUpload = require("express-fileupload");
app.use(fileUpload());
const multer = require("multer");
const upload = multer();

app.use(express.urlencoded({ extended: false }));
const dblib = require("./dblib.js");

// Set up EJS
app.set("view engine", "ejs");

// Enable CORS (see https://enable-cors.org/server_expressjs.html)
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

// Application folders
app.use(express.static("public"));

// Start listener
app.listen(process.env.PORT || 3000, () => {
    console.log("Server started (http://localhost:3000/) !");
});

//Define endpoints
app.get("/", (req, res) => {
      res.render("index");
});

app.get("/manage", async (req, res) => {
  // Omitted validation check
  const totRecs = await dblib.getTotalRecords();
  res.render("searchajax", {
      totRecs: totRecs.totRecords,
  });
});

app.post("/manage", async (req, res) => {
  await dblib.findCustomers(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));
});

app.get("/create", (req, res) => {
  res.render("createajax");
});

app.post("/create", async (req, res) => {
  await dblib.insertCustomer(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));
});

app.get("/edit/:id", async (req, res) => {
    const customer = { cusId: req.params.id }
    await dblib.findCustomers( customer )
    .then( result => 
      {
        console.log( result );
        res.render("editajax", { model: result.result[ 0 ] } );
      } )
    .catch(err => res.send({trans: "Error", result: err.message}));
});

app.post("/edit/:id", async (req, res) => {
  await dblib.updateCustomer(req.body)
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));
});

app.get("/delete/:id", async (req, res) => {
  const customer = { cusId: req.params.id }
  await dblib.findCustomers( customer )
  .then( result => 
    {
      console.log( result );
      res.render("deleteajax", { model: result.result[ 0 ] } );
    } )
  .catch(err => res.send({trans: "Error", result: err.message}));
});

app.post("/delete/:id", async (req, res) => {
await dblib.deleteCustomer(req.body)
    .then(result => res.send(result))
    .catch(err => res.send({trans: "Error", result: err.message}));
});

app.get("/reports", async (req, res) => {
  // Omitted validation check
  res.render("reportsajax");
});

app.post("/reports", async (req, res) => {
  await dblib.findCustomers( req.body, req.body.reportId )
      .then(result => res.send(result))
      .catch(err => res.send({trans: "Error", result: err.message}));
});

app.get("/import", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  res.render("import",{ totRecs: totRecs.totRecords });
});

//This is an unused endpoint. Left in because I worked on it, got it working at realized it does not meet the spec
//but it's a perfectly fine piece of code

app.post("/import", async (req, res) => {
   if(!req.files || Object.keys(req.files).length === 0) {
       message = "Error: Import file not uploaded";
       return res.send(message);
   };
   //Read file line by line, inserting records
   const fn = req.files.filename;
   const buffer = fn.data;
   const lines = buffer.toString().split(/\r?\n/);

   message = "";
   for( i = 0 ; i <  lines.length; ++i )
   {
    fields = lines[i].split(",");
    var customer =
    { 
      cusId : fields[ 0 ],
      cusFname : fields[ 1 ],
      cusLname : fields[ 2 ],
      cusState : fields[ 3 ],
      cusSalesYTD : fields[ 4 ],
      cusSalesPrev : fields[ 5 ]
    };

    await dblib.insertCustomer(customer)
    .then(result => 
      {
        message += result.result + "\n";
      })
    .catch(err => 
      {
        message += err.message + "\n";
      });
   }

   message += `Processing Complete - Processed ${lines.length} records`;
   res.send(message);
}); 

app.get("/export", async (req, res) => {
  const totRecs = await dblib.getTotalRecords();
  res.render("export",{ totRecs: totRecs.totRecords });
 });
 
 
 app.post("/export", async (req, res) => {
   var filename = "export.csv";

     if( req.body.filename )
     {
      filename = req.body.filename;
     }
     
     var customer = { cusId: "" };
     await dblib.findCustomers(customer)
     .then(result =>
      {
        var output = "";
        result.result.forEach(customer => {
            output += `${customer.cusid},${customer.cusfname},${customer.cuslname},${customer.cusstate},${customer.cussalesytd},${customer.cussalesprev}\r\n`;
        });
        res.header("Content-Type", "text/csv");
        res.attachment(filename);
        return res.send(output);
      })
     .catch(err => res.send({trans: "Error", result: err.message}));
 });
