require("dotenv").config();
const Client = require('pg').Client

const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({extended:true}));
const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(session({
    secret: "123456",
    saveUninitialized: false,
    resave: true
}));

const  client = new Client({
  user: "postgres",
  password: "raju",
  host: "localhost",
  port: 5432,
  database: "tarp"
})
client.connect(err=>{
  if(err){
      console.log("Error Connecting");
      console.log(err);
      return null;
  }else{
      console.log("Successfull Connection");
  }
})

app.use(express.static("payroll/STATIC/HTML"));
const indexx=require("./index.js")






app.listen(3000, () => {
    console.log("Now listening at port 3000...");
})

//app.post("/login/", (req, res) => {