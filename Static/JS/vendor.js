let company;
let loadedVendors = false;
let loadedTransactions = false;

function regVendor(e){
    e.preventDefault();
    data = {"ID":$("#vendor-dbsearch").val()}; //Data to be sent...vendor-dbsearch is the id of the form
    sendData(data,"/addVendor",(res)=>{
        res = JSON.parse(res);
        console.log(res);
        $("#regVendor_search").append(
            `<table>
                <tr>
                    <td>Company ID</td>
                    <td id="reg_vendor_id">${res[0].company_id}</td>
                </tr>
                <tr>
                    <td>Comapany Name</td>
                    <td>${res[0].company_name}</td>
                </tr>
                <tr>
                    <td></td>
                    <td><button onclick="confirm_reg_vendor(event)">Confirm</button></td>
                </tr>
            </table>`
            );
    })
}

function confirm_reg_vendor(e){
    e.preventDefault();
    let vendor_id = $("#reg_vendor_id").text();
    sendData({"ID":vendor_id},"/confirmVendor",(res)=>{
        console.log(res);
    })
}

function getTransactions(){
    if(!loadedTransactions){
        sendData({ID:'488817f7-c6ed-4f63-937b-b9ef716b5134'},"/orderGraph",(res)=>{
            console.log(res);
            var graphData = JSON.parse(res);
            addtoGraph("doughnut","buy_chart",checkNull(graphData.Buy, "transaction"),"Incoming");
            addtoGraph("doughnut","sell_chart", checkNull(graphData.Sell, "transaction"),"Outgoing");
        }, true)
        sendData({ID:'488817f7-c6ed-4f63-937b-b9ef716b5134'},"/orders",(res)=>{
            console.log(JSON.parse(res));
            res = JSON.parse(res);
            var index = 1;
            res.forEach(result =>{
                $("#transactions").append(
                    `<tr>
                        <td>${index++}</td>
                        <td>${result.order_id}</td>
                        <td>${result.trans_date.split("T")[0]}</td>
                        <td>${result.trans_amount}</td>
                        <td>1</td>
                        <td>${result.trans_status}</td>
                    </tr>`
                )
            })
        }, true)
        loadedTransactions = true;
    }
}

function checkNull(data, graphType){
    if(graphType === "transaction"){
        if(!data.hasOwnProperty("Complete")){
            data["Complete"] = '0'
        }else if(!data.hasOwnProperty("Pending")){
            data["Pending"] = '0'
        }
    }
    return data;
}

function sendData(data,server,callback, async = false){
    var xhtp = new XMLHttpRequest(); //Creating connection variable 
    xhtp.onreadystatechange = function(){
        if(this.readyState === 4 && this.status === 200){
            callback(this.responseText); // Response from server
        }
    }
    xhtp.open("POST",server,async);//Creating connection to backend path ("/addVendor")
    xhtp.setRequestHeader("Content-Type","application/json")
    xhtp.send(JSON.stringify(data));//Sending data 
}
function checkUser(){
    sendData("","/user",(res)=>{
        console.log(res);
        company = JSON.parse(res).company;
    })
}
function unregVendor(e){
    data={};
    e.preventDefault();
    let form = $("#unreg_vendor_form").serializeArray();
    form.forEach(element => {
        data[element.name] = element.value;
    });
    sendData(data,"/adduVendor",(res)=>{
        console.log(res);
    })
    
}
function viewVendors(){
    console.log("ViewVendors");
    data = {"ID":'488817f7-c6ed-4f63-937b-b9ef716b5134'};
    if(!loadedVendors){
        sendData(data,"/viewVendors",(res)=>{
            var result = JSON.parse(res);
            console.log(result[0]);
            $("#vendors_table").append(
                    `<tr>
                        <td>${result[0].vendor_name}</td>
                        <td>${result[0].product_name}</td>
                    </tr>`
                )
        })
        loadedVendors = true;
    }
}
function getVendorInvent(){
    data = {"ID":("$vendor-id").val()};
    sendData(data,"/getInvent",(res)=>{
        console.log(res);
    })
}