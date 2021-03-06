let company = "7b4bcde6-0c6e-4b37-b5d8-b36891b3ba87";
let loadedVendors = false;
let loadedTransactions = false;
closeModal()
function regVendor(e){
    e.preventDefault();
    data = {"ID":$("#vendor-dbsearch").val()}; //Data to be sent...vendor-dbsearch is the id of the form
    sendData(data,"/addVendor",(res)=>{
        res = JSON.parse(res);
        console.log(res);
        $("#regVendor_search").append(
            `<table class="vendor-result">
                <tr>
                    <td class="label border">Company ID</td>
                    <td class="data border" id="reg_vendor_id">${res[0].company_id}</td>
                </tr>
                <tr>
                    <td class="label border">Comapany Name</td>
                    <td class="data border">${res[0].company_name}</td>
                </tr>
                <tr>
                    <td></td>
                    <td class="data"><button id="confirm_reg" onclick="confirm_reg_vendor(event)">Confirm</button></td>
                </tr>
            </table>`
            );
    })
}

function confirm_reg_vendor(e){
    e.preventDefault();
    let vendor_id = $("#reg_vendor_id").text();
    sendData({ID:vendor_id},"/confirmVendor",(res)=>{
        console.log(res);
    })
}

function getTransactions(){
    if(!loadedTransactions){
        sendData({ID:company},"/orderGraph",(res)=>{
            console.log(res);
            var graphData = JSON.parse(res);
            if(graphData.Buy !== undefined)
                addtoGraph("doughnut","buy_chart",checkNull(graphData.Buy, "transaction"),"Incoming");
            if(graphData.Sell !== undefined)
                addtoGraph("doughnut","sell_chart", checkNull(graphData.Sell, "transaction"),"Outgoing");
        }, true)
        sendData({ID:company},"/orders",(res)=>{
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
    data = {"ID":company};
    if(!loadedVendors){
        sendData(data,"/viewVendors",(res)=>{
            var result = JSON.parse(res);
            console.log(result[0]);
            $("#vendors_table").append(
                    `<tr class="vendor_row">
                        <td>${result[0].vendor_name}</td>
                        <td>${result[0].product_name}</td>
                        <td>${result[0].vendor_addr}</td>
                        <td><button class="vendor-dets" onclick="getVendorInvent(event, this)" data-id=${result[0].vendor_id}>Details</td>
                    </tr>`
                )
        })
        sendData(data,"/viewRegVendor",(res)=>{
            var result = JSON.parse(res);
            console.log(result[0]);
            $("#vendors_table").append(
                    `<tr id =${result[0].company_id} class="vendor_row">
                        <td>${result[0].company_name}</td>
                        <td>${result[0].product_name}</td>
                        <td>${result[0].company_addr}</td>
                        <td><button class="vendor-dets" onclick="getVendorInvent(event, this)" data-id=${result[0].company_id}>Details</td>
                    </tr>`
                )
        })
        loadedVendors = true;
    }
}
function getVendorInvent(e,th){
    e.preventDefault();
    data = {"id":th.dataset.id};
    sendData(data,"/getInvent",(res)=>{
        showVendorModal()
        $("#vendor-modal-content").html(` 
        <div class="vendor-modal-heading"> 
            <h2>Vendor Inventory Details</h2>
        </div>               
        <div class="product-row">
            <div class="product-cell">Product Name</div>
            <div class="product-cell">Quantity</div>
        </div>`)
        let results = JSON.parse(res)
        if(results.length > 0) {
            results.forEach((result) => {
            $("#vendor-modal-content").append(`
                <div class="product-row">
                    <div class="product-cell">${result.product_name}</div>
                    <div class="product-cell">${result.quantity}</div>
                </div>
            `)
            })
        }else{
            $("#vendor-modal-content").append(`<divclass="product-row">Inventory cannot be retrieved since the vendor is not a client</div>`)
        }
    })
}
function showVendorModal(){
    $("#vendor-modal").show();
}

function closeModal(e=undefined, th = undefined) {
    if((e === undefined && th === undefined) || e.target === th) {
        $("#vendor-modal").hide();
    }
}