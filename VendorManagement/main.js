const express = require('express');
const sqlite3 = require('sqlite3').verbose(0);
const app = express();
const session = require('express-session');

//Declare Middlewares here
app.use(express.json());

//Session variable to store Client ID

//Use the last site access timestamp to check for updated inventory of vendors
app.use(session({
    secret:"TARP Proj",
    saveUninitialized:false,
    resave:false,
    unset:'destroy',
    cookie:{maxAge:3600*24}
}));

const db = sqlite3.Database('./vendor.db',sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
    if (err) {
      console.log(err.message);
    }
})

//route for adding vendor
app.post('/addVendor',(req,res)=>{
    var details = JSON.parse(req.body);
    db.get("Select ID from clients where C_NAME = ?",details.name,function(err,row){
        if(err)
            console.log(err);
        else
            console.log(row.id);
    })
})
//route for retrieving data from vendor
app.post('/getInvent',(req,res)=>{
    var details = JSON.parse(req.body);
    db.each("SELECT * from inventory where OWN_ID = ?",details.id,(err,row)=>{
        if(err){
            console.log(err);
        }else{
            console.log(row.id,row.name);
        }
    })
})
//route for checking for vendors
app.post('/checkVend',(req,res)=>{
    var details = JSON.parse(req.body);
    db.each("Select Name, ID from clients where C_NAME = ?",details.name,(err,row)=>{
        if(err)
            console.log(err);
        else
            console.log(row);
    })
})