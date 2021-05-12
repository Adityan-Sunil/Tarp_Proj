
//const R = require('ramda');
//var os = require("os");
//var hostname = os.hostname();

a=0;


function displayallemp(cid,client,callback)
{
    var ress=null;
    cid=pad(cid)
    //display all employees all details
    client.query("select * from employee where cid=$1", [cid],(err, res) => {
        if (!err) ress=res.rows;
        callback(ress,err)
      }) 

}

//displayallemp("1")
 function displaywhereemp(column,value,cid,client,callback)
{
    //display all employees all details where column vaule= given value ( inputs : column name & the entered value)
    //works for all values except join date in the menu
    //to disp list so its easier for admin to narrow
    //var column="name";
    var ress=null;
    var v="{"+value+"}";
    var vv="{"+cid+"}";
    client.query("select * from employee where "+column+" = $1 and cid = $2", [v,vv],(err, res) => {
        if (!err) ress=res.rows;
        callback(ress,err)
      }) 
}
//displaywhereemp("name","Adityan","1")
function pad(value)
{
    var v="{"+value+"}";
    return v;
}

function eidnumber(client, callback) {
    client.query("select count(*) from employee", (err, res) => {
        result = null;
        if (!err) result = res.rows[0].count; 
        callback(result, err);
    })
}


//eidnumber();
 function insertwithkey(date, name, dept, username, pass, sid, mobile, email, eid,cid,client,callback)
{
    //insert new employee values with automatic primary key for employee  SELECT count(*) FROM table_name
    var ress; var a; var str="Not Inserted";
    name=pad(name);
    dept=pad(dept);
    username=pad(username);
    pass=pad(pass);
    sid=pad(sid);
    mobile=pad(mobile);
    email=pad(email);
    eid=pad(eid);
    cid=pad(cid);
    
   client.query("insert into employee values ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)", [date, name, dept, username, pass, sid, mobile, email, eid,cid], (err, res) => {                         
    if(!err) str="Inserted";
    callback(str,err);
   })
}

function deleteemp(eid,client,callback)   // FULL COMPLETE delete
{
    var v="{"+eid+"}"; var sid; var res; var str="NOt deleted";
    // can delete only if they have eid
    client.query("select * from employee where eid = $1", [v], (err, res) => {
        if (err)  console.log( err)
        sid=res.rows[0].sid; console.log(sid);
      client.query("DELETE from salary where sid = $1", [sid], (err, res) => {
            if (err)  console.log( err)
        client.query("DELETE from employee where eid = $1 ", [v], (err, res) => {
        if (!err) str="Deleted";
        callback(str,err)
       }) 
    })   
})  
}

//displaywhereemp("eid","00006","1")
//eidnumber()
//insertwithkey("2019-08-01", "Aravind", "Tech", "aravind", "1234", "11100", "7299531111", "aravind@gmail.com", "00006","1")
//  deleteemp("00006")


function displayallsalary(cid,client,callback)
{
    //display all employees all details
    var ress=null;
    cid=pad(cid)
    client.query("select * from salary where sid in (select sid from employee where cid = $1)",[cid], (err, res) => {
        if (!err) ress = res.rows; 
        callback(ress, err);
    })

}
//displayallsalary("1")

function displaywheresalary(column,value,cid,client,callback)
{
    //display all salaries all details where column vaule= given value ( inputs : column name & the entered value)
    //works for all values except join date in the menu
    //to disp list so its easier for admin to narrow
    //var column="name";
    var ress;
    if (column=="sid"|| column=="paygrade")
    {
     value="{"+value+"}";}
    cid=pad(cid);
   client.query("select * from salary where "+column+" = $1 and sid in (select sid from employee where cid = $2)", [value,cid], (err, res) => {
    if (!err) ress = res.rows; 
    callback(ress, err);
})
}
//displaywheresalary("paygrade","third","1")
function insertsalaryrow(sid,paygrade ,currentsalary, app, bonus,extra,exrate,leave,paidl,leaverate, incentive,client,callback)
{
    //insert new employee values with automatic primary key for employee  SELECT count(*) FROM table_name
    sid=pad(sid); var ress="Not inserted";
    paygrade=pad(paygrade);
   
 client.query("insert into salary values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)", [sid,paygrade ,currentsalary, app, bonus,extra,exrate,leave,paidl,leaverate, incentive], (err, res) => {
    if (!err) ress = "Inserted" ;
    callback(ress, err);
})                                             

}
//insertsalaryrow("11100","third",5000,20,30,1,10,0,7,20,50)

function deletesalary(sid,client,callback)
{
    var v="{"+sid+"}"; var ress="Unsuccessful deletion";
    // can delete only if they have eid
 client.query("DELETE from salary where sid = $1 ", [v], (err, res) => {
    if (!err) ress = "Deleted"; 
    callback(ress, err);
})
}
//insertsalaryrow("11100","third",5000,20,30,1,10,0,7,20,50)
//insertwithkey("2019-08-01", "Aravind", "Tech", "aravind", "1234", "11100", "7299531111", "aravind@gmail.com", "00006","1")

function editemp(eid,column,value,client,callback)
{ var v=value;
    //if u know the empid of any employee admin can edit any of the rest of the columns
    if(column != "joindate"){
    v ="{"+value+"}";}
    var eidd="{"+eid+"}";
        var ress="Unsuccessful";
     client.query("UPDATE employee SET "+column+" =$1 where eid =$2", [v,eidd], (err, res) => {
        if (!err) ress = "Edited"; 
        callback(ress, err);
    })

}
//editemp("00001","dept","Management")
function editsalary(sid,column,value,client,callback)
{ var v=value;
    //if u know the sid of any employee admin can edit any of the rest of the columns
    if(column == "paygrade"){
  v ="{"+value+"}";}
    var sidd="{"+sid+"}";
   var ress="Unsuccessful";
    client.query("UPDATE salary SET "+column+" =$1 where sid =$2", [v,sidd], (err, res) => {
        if (!err) ress = "Edited"; 
        callback(ress, err);
    })
}
//editsalary("11000","paygrade","fourth")
//editsalary("11000","extrahours",100)
//displayallsalary()


function monthsalary(cid,client,callback)
{ var i;var a=0; cid=pad(cid); var res; var ress="Not made"; var str="";
    //number of rows needed for this
    client.query("select count(*) from salary where sid in (select sid from employee where cid = $1)",[cid], (err, res) => {
        if (!err) 
        {ress = "Counted"; 
         a=res.rows[0].count;
        client.query("select * from salary where sid in (select sid from employee where cid = $1)",[cid], (err, res) => {
        if (!err) 
        {ress = "Selected"; 
   results=res;

        for ( i=0; i< a; i++)
        {
        sid=results.rows[i].sid;
        salary=results.rows[i].currentsalary;
        extrahours=results.rows[i].extrahours;
        extrahrrate=results.rows[i].extrahrrate;
        leavedays=results.rows[i].leavedays;
        paidleave=results.rows[i].paidleave
        leaverate=results.rows[i].leaverate
        extraincentive=results.rows[i].extraincentive
        salary=Number(salary)+Number(extrahours*extrahrrate)+Number((extraincentive/100)*salary)
        if(leavedays>paidleave)
        {
            salary=Number(salary)-Number((leavedays-paidleave)*leaverate);
        }
        str=str+(sid+" - "+salary + "\n ");
        }
       ress=str;
        callback(ress,err)
    }}) }})
}
//var eids=eidnumber()
//monthsalary("1")     


function yearlyupdate(cid,client)
{ var ress="not updated"; cid=pad(cid)
    //number of rows needed for this
    client.query("UPDATE salary SET (currentsalary) = ( SELECT ((appraisalrateyearly/100) * currentsalary)     from salary where sid in (select sid from employee where cid = $1))",[cid], (err, res) => {
        if (!err) ress = "Updated success"; 
        callback(ress, err);
    })
 

}
//yearlyupdate()  //multiple column error???????????????????????



module.exports={displayallemp,displaywhereemp,eidnumber,insertwithkey,deleteemp,displayallsalary,displaywheresalary,insertsalaryrow,deletesalary,editemp,editsalary,monthsalary,yearlyupdate}