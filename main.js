const express = require('express');
const app = express();
const session = require('express-session');
const cookieParser = require('cookie-parser')
require("dotenv").config();



const mustacheExpress = require('mustache-express');
const mustache = mustacheExpress();

mustache.cache = null;
app.engine('mustache', mustache);
app.set('view engine', 'mustache');


const pg = require("pg");
const e = require('express');
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});

db.connect((err)=>{
    if(err)
        console.log(err);
});


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

//************************************Login and Signup********************************* */
app.post("/login/", (req, res) => {
    const user = req.body;
    console.log(user);
    db.query("SELECT Emp_ID, Company_ID, Emp_Designation FROM Employee WHERE Emp_Username = $1 AND Emp_Password = $2", [user.username, user.password], (err, result) => {
        if (err) {
            console.log("Rejecting dur to error: " + err);
            res.send("reject");
            throw err;
        }
        if (result.rows.length == 1) {
            req.session.user = result.rows[0].emp_id;
            req.session.company = result.rows[0].company_id;
            req.session.userType = result.rows[0].Emp_Designation;
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
        res.send({user: req.session.user, company: req.session.company, userType: req.session.userType});
    } else {
        res.send(null);
    }
})
//************************************************************************************* */
app.post("/company/", (req, res) => {
    const CompanyID = req.body.Company_ID;
    console.log(req.body);
    db.query("SELECT * from Company WHERE Company_ID = $1", [CompanyID], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            console.log(result.rows[0]);
            res.send(result.rows[0]);
        }
    })
})

app.post("/employee_count/", (req, res) => {
    const Company_ID = req.body.Company_ID
    db.query("SELECT COUNT(*) AS numEmployees from Employee WHERE Company_ID = $1", [Company_ID], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            console.log(result.rows[0]);
            res.send(result.rows[0]);
        }
    })
})

//***********************************Customer Service***********************************/

app.post("/add_ticket/", (req, res) => {
    const ticket = req.body;
    const user = req.session.user;
    const company = req.session.company;
    const closed = (ticket.status == "closed");
    const now = new Date();

    db.query("INSERT INTO Customer_Service (Company_ID, Reg_ID, Registered_On, Deadline, Closed, Last_Update, Last_Update_Status, Title, Description) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *",
    [company, user, ticket.registered_on, ticket.deadline, closed, now, ticket.status, ticket.title, ticket.description],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0]);
        }
    })
});

app.post("/update_ticket/", (req, res) => {
    const ticket = req.body;
    const closed = (ticket.status == "Closed");
    const now = new Date();
    db.query("UPDATE Customer_Service SET Last_Update = $1, Last_Update_Status = $2, Closed = $3, Update_Message = $4 WHERE Service_ID = $5 RETURNING *",
    [now, ticket.status, closed, ticket.message, ticket.service_id],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0]);
        }
    })
});

app.post("/modify_ticket/", (req, res) => {
    const ticket = req.body;
    db.query("UPDATE Customer_Service SET Registered_On = $1, Deadline = $2, Title = $3, Description = $4 WHERE Service_ID = $5 RETURNING *",
    [ticket.registered_on, ticket.deadline, ticket.title, ticket.description, ticket.service_id],
    (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0]);
        }
    });
})

app.post("/delete_ticket/", (req, res) => {
    const ticket = req.body.service_id;
    db.query("DELETE FROM Customer_Service WHERE Service_ID = $1", [ticket], (err) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send("accept");
        }
    })
});

app.post("/fetch_tickets_by_company/", (req, res) => {
    const company = req.session.company;
    db.query("SELECT * FROM Customer_Service WHERE Company_ID = $1", [company], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(res.rows);
        }
    })
})

app.post("/fetch_tickets_by_reg/", (req, res) => {
    const user = req.session.user;
    db.query("SELECT * FROM Customer_Service WHERE Reg_ID = $1", [user], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows);
        }
    })
})

app.post("/fetch_tickets_by_emp/", (req, res) => {
    const user = req.session.user;
    db.query("SELECT * FROM Customer_Service WHERE Emp_ID = $1", [user], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows);
        }
    })
})

app.post("/fetch_ticket_by_id/", (req, res) => {
    const ticket = req.body.service_id;
    db.query("SELECT * FROM Customer_Service WHERE Service_ID = $1", [ticket], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0]);
        }
    })
})

app.post("/fetch_unassigned_tickets/", (req, res) => {
    const company = req.session.company;
    db.query("SELECT * FROM Customer_Service WHERE Company_ID = $1, Emp_ID = NULL", [company], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows);
        }
    })
})

app.post("/claim_ticket/", (req, res) => {
    const user = req.session.user;
    const ticket = req.session.ticket;
    db.query("UPDATE Customer_Service SET Emp_ID = $1 WHERE Service_ID = $2 RETURNING *", [user, ticket], (err, result) => {
        if (err) {
            console.log(err);
        } else {
            res.send(result.rows);
        }
    })
})

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
    db.query("INSERT INTO VENDOR (product_name, vendor_addr, vendor_contact, vendor_email, vendor_name) VALUES($1,$2,$3,$4,$5)",[details.prod_name,details.add,details.contact, details.email, details.Name],(err)=>{
        if(err){
            console.log(err);
            res.send("Query failed");
        }else{
            res.send("Success");
        }
    })
    console.log(details);
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
    db.query("SELECT COUNT(*) FROM Employee", (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
        } else {
            res.send(result.rows[0].count)
        }
    })
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
  })

//************************************************************************************* */
//********************************Inventory Management******************************** */

app.post('/stocks/add/', (req, res) => {
    console.log('post body', req.body);
        const sql = 'INSERT INTO Inventory VALUES ($1,$2,$3, $4)';
        const params = [req.body.prod_id, req.body.prod_name, req.body.quant, req.body.company];
        db.query(sql, params,(error,results) => {
            if(error){
                console.log(error);
                res.send(error);
            }else{
                res.send("success");
            }
        });

});


app.post('/stocks', (req, res) => {
    db.query('SELECT * FROM Inventory where company_id = $1',[req.body.id],(error, results) => {
        if (error) {
            console.log(error);
            res.send(error);
        } else {
            console.log('results?', results.rows)
            res.send(results.rows);
        }
    })
});

app.post('/stocks/delete/', (req, res) => {

    const sql = 'DELETE FROM Inventory WHERE product_id = $1 and company_id = $2'
    const params = [req.body.prod_id, req.body.company];
    db.query(sql, params,(error, results) => {
        if(error) {
            console.log(error);
            res.send(error);
        } else {
            res.send("success");
        }
    });

});

app.post("/graphData", (req,res)=>{
    var output = [];
    const sql = "Select trans_type, sum(trans_amount) from transactions group by trans_type; Select trans_type, count(trans_type) from transactions group by trans_type; ";
    db.query(sql,(errors, result)=>{
        if(errors){
            console.log(errors)
        }else{
            result.forEach(element => {
                output.push(element.rows);
            });
            console.log(output);
            res.send(JSON.stringify(output));
        }
    })
})

app.get('/stocks/edit/:id', (req, res) => {

    const sql = 'SELECT * FROM Inventory WHERE product_id =$1'
    const params = [req.params.id];
    db.query(sql, params,(error,results) => {
        if(error){
            console.log(error)
        } else {
            console.log('results?', results);
            res.render('stocks-edit', { stock: results.rows[0] });
        }
    });


})

//Edit details of stock
app.post('/stocks/edit/', (req, res) => {

    const sql = 'UPDATE Inventory SET product_name=$1, quantity =$2 WHERE product_id=$4 and company_id = $3'
    const params = [req.body.prod_name, req.body.prod_quant, req.body.company, req.body.prod_id];
    db.query(sql, params,(error, results) => {
        if(error){
            console.log(error);
            res.send(error);
        } else {
            res.send("success");
        }
    });


})


//dashboard
app.post('/dashboard', (req, res) => {
    
    db.query('Select * from INVENTORY where company_id = $1',[req.body.id],(error, results) => {
        if(error){
            console.log(error);
            res.send(error);
        } else {
            console.log('results?', results.rows);
            res.send(result.rows);
        }
    });

})

app.listen(3000,()=>{
    console.log("Listening on 3000")
});