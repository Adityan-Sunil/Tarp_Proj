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


app.post('/showallemps',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  //console.log(indexx)
  indexx.displayallemp(details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})

app.post('/showallempswhere',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.displaywhereemp(details.column, details.value,details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})

app.post('/eidnumber',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  //s=indexx.eidnumber(client)
  indexx.eidnumber(client, (count, err) => {
  console.log("this is query result: " + count);
  if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(count)
    }
  });
})

app.post('/insertwithkey',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.insertwithkey(details.date, details.name, details.dept, details.username, details.pass, details.sid, details.mobile, details.email, details.eid,details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})

app.post('/deleteemp',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
   indexx.deleteemp(details.eid, client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/displayallsalary',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.displayallsalary(details.cid,client, (result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/displaywheresalary',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.displaywheresalary(details.column, details.value,details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/insertsalaryrow',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.insertsalaryrow(details.sid,details.paygrade ,details.currentsalary, details.app, details.bonus,details.extra,details.exrate,details.leave,details.paidl,details.leaverate, details.incentive,client, (result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/deletesalary',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  s = indexx.deletesalary(details.sid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/editemp',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
 indexx.editemp(details.eid,details.column,details.value,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/editsalary',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  s = indexx.editsalary(details.sid,details.column,details.value,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/monthsalary',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.monthsalary(details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})


app.post('/yearlyupdate',(req,res)=>{
  console.log(req.body);
  var details=(req.body);
  indexx.yearlyupdate(details.cid,client,(result,err)=> {
    if (err) {
      console.log("this error was encountered: " + err);
  } else {
      console.log("no errors!"); 
      res.send(result)
    }
  });
})



app.listen(3000, () => {
    console.log("Now listening at port 3000...");
})

//app.post("/login/", (req, res) => {