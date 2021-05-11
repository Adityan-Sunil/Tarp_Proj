const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
require("dotenv").config();

const pg = require("pg");
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});
db.connect();

// var pgp = require('pg-promise')(/* options */)
// var db = pgp('postgres://postgres:root@localhost:5432/TARP')



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
    db.query("SELECT Emp_ID FROM Employee WHERE Emp_Username = $1 AND Emp_Password = $2", [user.username, user.password], (err, result) => {
        if (err) {
            console.log("Rejecting dur to error: " + err);
            res.send("reject");
            throw err;
        }
        if (result.rows[0].emp_id) {
            req.session.user = result.rows[0].emp_id;
            res.send("accept");
        } else {
            console.log("Rejecting due to incorrect login: " + result.rows);
            res.send("reject");
        }
    })
});

app.post("/register_company/", (req, res) => {
    const company = req.body.company;
    const user = req.body.user;
    const now = new Date();
    db.query("INSERT INTO Company(Company_Name, Company_Reg, Company_MSHP, MSHP_Last_Update) VALUES($1, $2, $3, $4) RETURNING Company_ID", [company.name, now, company.membership, now], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            user.designation = "Admin";
            insertUser(user, result.rows[0].company_id, (rows) => {
                req.session.user = rows[0].emp_id;
                req.session.company = result.rows[0].company_id;
                res.send("accept");
            }, (err) => {
                console.log(err);
                res.send("reject");
            });
        }
    })
});

async function insertUser(user, company, callback, errorHandle) {
    db.query("INSERT INTO Employee(Emp_Name, Emp_UserName, Emp_Password, Emp_JoinDate, Emp_Designation, Emp_Email, Company_ID) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING Emp_ID",
    [user.name, user.username, user.password, new Date(), user.designation, user.email, company],
    (err, res) => {
        if (err) {
            if (errorHandle) {
                errorHandle(err);
            }
        } else {
            if (callback) {
                callback(res.rows);
            }
        }
    })
}

app.post("/register_user/", (req, res) => {
    const user = req.body.user;
    const company_id = req.body.company_id;
    insertUser(user, company_id, (rows) => {
        res.send("accept");
    }, (err) => {
        res.send("reject");
        console.log(err);
    });
    
})

app.post("/logout/", (req, res) => {
    req.session.user = null;
    req.session.company = null;
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