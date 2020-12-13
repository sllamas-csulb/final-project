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
  console.log( "POST Manage" );
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