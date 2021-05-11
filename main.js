const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
require("dotenv").config();

const pg = require("pg");
const e = require('express');
// const db = new pg.Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {rejectUnauthorized: false}
// });
const db = new pg.Client({
        user: "postgres",
        password: "root",
        host: "localhost",
        port: 5432,
        database: "tarp"
});

db.connect((err)=>{
    if(err)
        console.log(err);
});

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
        res.send({user: req.session.user, company: req.session.company});
    } else {
        res.send(null);
    }
})
//************************************************************************************* */

//***********************************Vendor Management******************************** */

//route for adding already existing vendor
app.post('/addVendor',(req,res)=>{
    var details =req.body; //get data from http request and convert to json
    console.log(details.ID);
    db.query("Select company_id, company_name from company where Company_id = $1",[details.ID],function(err,result){ //create and execute db query
        if(err){
            console.log(err);
            res.send(err);
        }
        else
            res.send(result.rows); //Send response back to client
    })
})

//route for adding non client vendor
app.post('/adduVendor',(req,res)=>{
    var details = req.body;
    // db.query("INSERT INTO VENDORS VALUES(?,?,?,?,?)",[details.name,details.product,details.quantity],(err)=>{
    //     if(err){
    //         console.log(err);
    //         res.send("Query failed");
    //     }else{
    //         res.send("Success");
    //     }
    // })
    console.log(details);
    res.send("accepted");
})

app.post('/viewVendors', (req,res)=>{
    var details = req.body;
    console.log(details);
    db.query("Select v.vendor_name, v.vendor_id, v.product_name from vendor v, vendor_reg r where r.vendor_id = v.vendor_id and r.company_id = $1",[details.ID],(err, result)=>{
        if(err){
            console.log(err);
        }else{
            console.log(result.rows);
            res.send(result.rows)
        }
    })
})

//route for retrieving data from vendor
app.post('/getInvent',(req,res)=>{
    var details = JSON.parse(req.body);
    db.query("SELECT * from inventory where OWN_ID = ?",[details.id],(err,result)=>{
        if(err){
            console.log(err);
            res.send(null);
        }else{
            res.send(result);
        }
    })
})
//route for checking for vendors
app.post('/checkVend',(req,res)=>{
    var details = JSON.parse(req.body);
    db.each("Select Name, ID from clients where C_NAME = ?",details.name,(err,result)=>{
        if(err){
            res.send(null);
            console.log(err);
        }
        else
            console.log(row);
            res.send(result)
    })
})
//confirm vendor and add to reg_vendor table
app.post("/confirmVendor",(req,res)=>{
    var id = req.body.ID;
    db.query("Insert into vendor_reg(company_id, vendor_id) Values($1,$2)",["488817f7-c6ed-4f63-937b-b9ef716b5134",id],(err)=>{
        if(err){
            console.log(err);
            res.send(err)
        }else{
            res.send("Success");
        }
    })
})

app.post("/orders",(req,res) =>{
    var id = req.body.ID;
    db.query("select * from transactions where company_id = $1", [id], (err, result)=>{
        if(err){
            console.log(err);
            res.send("failed");
        }
        else{
            //console.log(result.rows);
            res.send(result.rows);
        }
    })
})

app.post("/orderGraph", (req,res)=>{
    var id = req.body.ID;
    var output = {};
    db.query("select trans_type, trans_status, count(trans_status) from (select * from transactions where company_id = $1) as T1 group by trans_status, trans_type;", [id],(err,result)=>{
        if(err){
            console.log(err)
            res.send("failed");
        }else{
            console.log(result.rows);
            result.rows.forEach(result =>{
                if(!output.hasOwnProperty(result.trans_type)){
                    count = {}
                    count[result.trans_status]  = result.count
                    output[result.trans_type] = count
                }else {
                    output[result.trans_type][result.trans_status] = result.count;
                }
            })
            console.log(output);
            res.send(JSON.stringify(output));
        }
    })
})
//************************************************************************************* */

app.listen(3000,()=>{
    console.log("Listening on 3000")
});