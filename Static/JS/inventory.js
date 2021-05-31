let past_orders;
let company = "7b4bcde6-0c6e-4b37-b5d8-b36891b3ba87";
let loaded = false;
getInvent();
$("#add-product-modal").hide();
$("#updateFormModal").hide();
function getCompany(){
    sendData("","/user", (res)=>{
        company = JSON.parse(res).company;
    })
}
//Get Past Orders
function getInvent(){
    if(!loaded) {
            sendData({id:company}, "/stocks", (res)=>{
                console.log(res);
                var count = 1;
                var results = JSON.parse(res);
                $("tr").remove(".past-data");
                results.forEach(result => {
                    $("#past_orders").append(
                        `<tr class="past-data">
                            <td>${count++}</td>
                            <td>${result.product_id}</td>
                            <td>${result.product_name}</td>
                            <td>${result.quantity}</td>
                            <td>
                                <button name=${result.product_name} data-id=${result.product_id} data-quant=${result.quantity} type="button" class="btn btn-primary" onclick="updateProduct(event, this)">Update</button>
                                <button data-id=${result.product_id} style="margin-left:1%" type="button" class="btn btn-danger" onclick="deleteProduct(event, this)">Delete</button>
                            </td>
                    </tr>`
                    )    
                });
            },false)
            //TODO display in table
    }
}
$("#add-product-modal").click(function (e) { 
    e.preventDefault();
    if(e.target == this)
        closeModal();
});
function showAddModal() {
    $("#add-product-modal").show();
}
function closeModal() {
    $("#add-product-modal").hide();
}
function showUpdateForm(th){
    var id = th.dataset.id;
    $("#update-form").append(`            
    <table>
        <tr>
            <td>Product Name</td>
            <td><input type="text" name="prod_name" value = ${th.name}></td>
        </tr>
        <tr>
            <td>Product Quantity</td>
            <td><input type="text" name="prod_quant" value="${th.dataset.quant}"></td>
        </tr>
        <tr>
            <td><button type="button" class="btn btn-primary" onclick="updateProd(event, '${id}')">Submit</button></td>
            <td></td>
        </tr>
    </table>`)
    $("#updateFormModal").show();
}
function hideupdateForm(){
    $("#updateFormModal").hide();
}
function updateInventory(){
    //recieve from input form
    sendData({id:company},"/stocks/edit/", (res)=>{
        console.log(res);
    }, false)
}

function deleteProduct(e, ths){
    var id = ths.dataset.id
    console.log(id);
    sendData({company:company, prod_id:id},"/stocks/delete/",(res)=>{
        if(res == "success"){
            loaded = false;
            getInvent();
        }
    }, false)
}
function updateProduct(e, th){
    showUpdateForm(th);
}

function drawGraphs() {
    console.log("graphs");
    var count = 1;
    var type;
    sendData({company:company}, "/graphData", (res)=>{
        res = JSON.parse(res);
        res.forEach(re => {
            var title;
            var data = {};
            re.map(element=>{
                if(element.sum){
                    data[element.trans_type] = element.sum;
                    title = "Net Earnings";
                }
                else{
                    data[element.trans_type] = element.count;
                    title = "Transaction Types"
                }
            })
            if(count == 1)
                type = 'doughnut'
            else
                type = 'bar'
            addtoGraph(type,"graph"+(count++).toString(), data,title);
        });
        sendData({company:company},"/orderGraph",(res)=>{
            console.log(res);
            var graphData = JSON.parse(res);
            addtoGraph('doughnut',"graph3",checkNull(graphData.Buy, "transaction"),"Incoming Transactions");
            addtoGraph('doughnut',"graph4", checkNull(graphData.Sell, "transaction"),"Outgoing Transactions");
        }, true)
        addtoGraph("graph1", )
    })
    sendData({company:company}, "orderGraph", (res)=>{
        console.log(JSON.parse(res));
    })
 }


function updateProd(e, id){
    e.preventDefault();
    var form = $("#update-form").serializeArray();
    var data = {}
    form.map(element=>{
        data[element.name] = element.value
    })
    data['company'] = company;
    data['prod_id'] = id;
    console.log(data);
    sendData(data, "/stocks/edit", ()=>{
        hideupdateForm();
        loaded = false;
        getInvent();
    }, false)
}

function regProduct(e){
    console.log("hello");
    e.preventDefault();
    console.log("Registering Product");
    var form_details = $("#add_product").serializeArray();
    data = {}
    form_details.map(element =>{
        data[element.name] = element.value
    })
    data['company'] = company;
    console.log(data);
    sendData(data, "/stocks/add",(res)=>{
        console.log(res);
        loaded = false;
        getInvent();
        closeModal();
    }, false);
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