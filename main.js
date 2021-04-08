const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
require("dotenv").config();

// const pg = require("pg");
// const db = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {rejectUnauthorized: false}
// });
// db.connect();

var pgp = require('pg-promise')(/* options */)
var db = pgp('postgres://postgres:root@localhost:5432/TARP')



//Declare Middlewares here
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({extended:true}));
app.use(express.static("Static/HTML"));
app.use(express.static("Static/CSS"));
app.use(express.static("Static/JS"));

//Session variable to store Client ID

//Use the last site access timestamp to check for updated inventory of vendors
app.use(session({
    secret:"TARP Proj",
    saveUninitialized:false,
    resave:false,
    unset:'destroy',
    cookie:{maxAge:3600*24}
}));

// const db = sqlite3.Database('./vendor.db',sqlite3.OPEN_CREATE | sqlite3.OPEN_READWRITE, (err) => {
//     if (err) {
//       console.log(err.message);
//     }
// })

//************************************Login and Signup********************************* */
app.post("/login/", (req, res) => {
    const user = req.body;
    console.log(user);
    db.query("SELECT COUNT(*) FROM userInfo WHERE email = $1 AND pwd = $2", [user.email, user.pwd], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
            throw err;
        }
        if (result.rows[0].count == 1) {
            req.session.user = user.email;
            console.log(result.rows);
            res.send("accept");
        } else {
            res.send("reject");
        }
    })
});

app.post("/signup/", (req, res) => {
    const user = req.body;
    console.log(user);
    db.query("INSERT INTO userInfo VALUES($1, $2)", [user.email, user.pwd], (err) => {
        if (err) {
            res.send("reject");
        } else {
            req.session.user = user.email;
            res.send("accept");
        }
    })
    
})

app.post("/logout/", (req, res) => {
    req.session.user = null;
    res.send("accept");
})

//Always check with this to make sure user is logged in, even before loading the page
app.get("/user/", (req, res) => {
    if (req.session.user != null) {
        res.send(req.session.user);
    } else {
        res.send(null);
    }
})
//************************************************************************************* */

//***********************************Vendor Management******************************** */

//route for adding already existing vendor
app.post('/addVendor',(req,res)=>{
    var details = JSON.parse(req.body); //get data from http request and convert to json
    db.one("Select ID from clients where C_NAME = ?",details.ID,function(err,row){ //create and execute db query
        if(err)
            console.log(err);
        else
            console.log(row.id);
            res.send(row.id); //Send response back to client
    })
})

//route for adding non client vendor
app.post('/adduVendor',(req,res)=>{
    var details = JSON.parse(req.body);
    db.query("INSERT INTO VENDORS VALUES(?,?,?,?)",details.name,details.product,details.quantity0)
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
//************************************************************************************* */

app.listen(3000,()=>{
    console.log("Listening on 3000")
});