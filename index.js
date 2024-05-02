const express = require("express");
const app = express();

//dotenv
require("dotenv").config();

//Cors
const cors= require("cors");
app.use(cors());

//Database
const database = require("./configs/database");
database.connect();

//Port
const port = process.env.PORT || 3000;

//body-parser
const bodyParser = require("body-parser");
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

//router v1
const routesVer1 = require("./api/v1/routes/index.route");

//router v1
routesVer1(app);
app.listen(port, () => {
  console.log(`Example app listening at http://localhost:${port}`);
});
