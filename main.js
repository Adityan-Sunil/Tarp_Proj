const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
require("dotenv").config();

const pg = require("pg");
const e = require('express');
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});
// const db = new pg.Client({
//         user: "postgres",
//         password: "root",
//         host: "localhost",
//         port: 5432,
//         database: "tarp"
// });

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
                    var count = {}
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

app.post('/showallemps',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    //console.log(indexx)
    db.query("SELECT * FROM Employee WHERE Company_ID = $1", [details.cid], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows);
        }
    })
    // indexx.displayallemp(details.cid,client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
//Change the way this where query is written, write multiple endpoints if necessary
//   app.post('/showallempswhere',(req,res)=>{
//     console.log(req.body);
//     var details=(req.body);
//     indexx.displaywhereemp(details.column, details.value,details.cid,client,(result,err)=> {
//       if (err) {
//         console.log("this error was encountered: " + err);
//     } else {
//         console.log("no errors!"); 
//         res.send(result)
//       }
//     });
//   })
  
  app.post('/eidnumber',(req,res)=>{
    console.log(req.body);
    //var details=(req.body); // useless ?
    //s=indexx.eidnumber(client)
    db.query("SELECT COUNT(*) FROM Employee", (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0].count)
        }
    })
    // indexx.eidnumber(client, (count, err) => {
    // console.log("this is query result: " + count);
    // if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(count)
    //   }
    // });
  })
  
  //clone of register_user ?
  app.post('/insertwithkey',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    const user = {
        name: details.name,
        username: details.username,
        password: details.pass,
        Emp_JoinDate: details.date,
        designation: details.dept,
        email: details.email,
        Salary_ID: details.sid,
        Company_ID: details.cid
    }
    insertUser(user, details.cid, (rows) => {
        res.send(rows)
    }, (err) => {
        res.send("reject");
        console.log(err);
    })
    // indexx.insertwithkey(details.date, details.name, details.dept, details.username, details.pass, details.sid, details.mobile, details.email, details.eid,details.cid,client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  app.post('/deleteemp',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("DELETE FROM Employee WHERE Emp_ID = $1 RETURNING Salary_ID", [details.eid], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            if (result.rows.length != 1) {
                res.send("reject");
            } else {
                if (result.rows[0].salary_id) {
                    db.query("DELETE FROM Payroll WHERE Salary_ID = $1", [result.rows[0].salary_id], (err, result) => {
                        if (err) {
                            console.log(err);
                            res.send("reject");
                        } else {
                            res.send("Deleted");
                        }
                    })
                } else {
                    res.send("Deleted");
                }
            }
        }
    });
    //  indexx.deleteemp(details.eid, client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  
  app.post('/displayallsalary',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("SELECT * FROM Payroll WHERE Salary_ID in (SELECT Salary_ID FROM Employee where Company_ID = $1)", [details.cid], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows);
        }
    })
    // indexx.displayallsalary(details.cid,client, (result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  //change the way this where query is executed, write separate endpoints if necessary
//   app.post('/displaywheresalary',(req,res)=>{
//     console.log(req.body);
//     var details=(req.body);
//     indexx.displaywheresalary(details.column, details.value,details.cid,client,(result,err)=> {
//       if (err) {
//         console.log("this error was encountered: " + err);
//     } else {
//         console.log("no errors!"); 
//         res.send(result)
//       }
//     });
//   })
  
  
  app.post('/insertsalaryrow',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("INSERT INTO Payroll(Paygrade, Current_Sal, App_Rate, Bonus_Rate, Extra_Hours, Extra_Hour_Rate, Leave_Days, Paid_Leave, Leave_Rate, Extra_Incent) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)",
    [details.paygrade, details.currentsalary, details.app, details.bonus, details.extra, details.exrate, details.leave, details.paidl, details.leaverate, details.incentive],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send("Inserted");
        }
    })
    // indexx.insertsalaryrow(details.sid,details.paygrade ,details.currentsalary, details.app, details.bonus,details.extra,details.exrate,details.leave,details.paidl,details.leaverate, details.incentive,client, (result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  
  app.post('/deletesalary',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("DELETE FROM Payroll WHERE Salary_ID = $1", [details.sid], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send("Deleted");
        }
    });
    // var s = indexx.deletesalary(details.sid,client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  //Write this function differently so it either checks for the column or overwrites all columns
//   app.post('/editemp',(req,res)=>{
//     console.log(req.body);
//     var details=(req.body);
//    indexx.editemp(details.eid,details.column,details.value,client,(result,err)=> {
//       if (err) {
//         console.log("this error was encountered: " + err);
//     } else {
//         console.log("no errors!"); 
//         res.send(result)
//       }
//     });
//   })
  
  //Similar to the edit employee function, rewrite this
//   app.post('/editsalary',(req,res)=>{
//     console.log(req.body);
//     var details=(req.body);
//     s = indexx.editsalary(details.sid,details.column,details.value,client,(result,err)=> {
//       if (err) {
//         console.log("this error was encountered: " + err);
//     } else {
//         console.log("no errors!"); 
//         res.send(result)
//       }
//     });
//   })
  
  
  app.post('/monthsalary',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("SELECT Salary_ID, (Current_Sal + (Extra_Hours * Extra_Hour_Rate) + ((Extra_Incent / 100) * Current_Sal) - (GREATEST(Leave_Days - Paid_Leave, 0) * Leave_Rate)) AS Salary FROM Payroll where Salary_ID IN (SELECT Salary_ID FROM Employee where Company_ID = $1)", 
    [details.cid],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            console.log(result.rows);
            res.send(result.rows);
        }
    })
    // indexx.monthsalary(details.cid,client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })
  
  
  app.post('/yearlyupdate',(req,res)=>{
    console.log(req.body);
    var details=(req.body);
    db.query("UPDATE Payroll SET Current_Sal = (SELECT ((App_Rate / 100) * Current_Sal) FROM Payroll WHERE Salary_ID IN (SELECT Salary_ID FROM Employee WHERE Company_ID = $1))",
    [details.cid],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send("Update success");
        }
    })
    // indexx.yearlyupdate(details.cid,client,(result,err)=> {
    //   if (err) {
    //     console.log("this error was encountered: " + err);
    // } else {
    //     console.log("no errors!"); 
    //     res.send(result)
    //   }
    // });
  })

//************************************************************************************* */
app.listen(3000,()=>{
    console.log("Listening on 3000")
});