let designation;
let company = "81afb988-db90-4fd2-b0df-d22ee39406b5";
let data  ={}; 
let title = "Title"

let pieData = {
    data :{
        label:Object.keys(data),
        datasets:[{
            circumference:180,
            rotation: -90,
            data: Object.values(data),
            radius:'50%',
            backgroundColor:[
                '#2b6777',
                '#c8d8e4',
            ], 
            hoverOffset: 4,
        }]
    },
}

let barData = {
    data: {
        label:Object.keys(data),
        datasets:[{
            data:Object.values(data),
            backgroundColor:[
                '#2b6777',
                '#c8d8e4',
            ], 
            hoverOffset: 4,
        }]
    }
}

let lineData = {
    data: {
        label:Object.keys(data),
        datasets:[{
            data:Object.values(data),
            borderColor:'#2b6777', 
            backgroundColor:[
                '#2b6777',
                '#c8d8e4',
            ],
            hoverOffset: 4,
        },
        {
            data:Object.values(data),
            borderColor:'#c8d8e4', 
            backgroundColor:[
                '#c8d8e4',
            ],
            hoverOffset: 4,
        } ]
    }
}

let pieOptions = {
    type:'doughnut',    
    options:{
        maintainAspectRatio: false,
        responsive: true,
        layout:{
            padding:0
        },
        plugins:{
            title:{
                display:true,
                text:title,
                font:{
                    size:18
                }
            }
        }
    }
}

let lineOptions = {
    type:'line',    
    options:{
        maintainAspectRatio: false,
        responsive: true,
        layout:{
            padding:0
        },
        plugins:{
            title:{
                display:true,
                text:title,
                font:{
                    size:18
                }
            }
        },
        scales:{
            yAxis:{}
        }
    }
}

let barOptions = {
    type:"bar",
    options:{
        indexAxis:'y',
        maintainAspectRatio: false,
        responsive: true,
        layout:{
            padding:0
        },
        plugins:{
            legend:{
                display:false
            },
            title:{
                display:true,
                text: "Transactions",
                font:{
                    size:18
                }
            }
        },
    }
}

function customerGraph(title){
    //Post service_graph
    console.log(title);
    sendData({company:company}, "/service_graph", (res) => {
        let result = JSON.parse(res);
        console.log(result);
        let data = {}
        result.map(element =>{
            data = element
        })
        console.log(data);
        pieData.data.labels = Object.keys(data);
        pieData.data.datasets[0].data = Object.values(data);
        pieOptions.data = pieData.data;
        pieOptions.options.plugins.title.text = title;
        //Get customer service graph
        new Chart($("#tab1_graph"), pieOptions)
        console.log(pieOptions);
    })
}
function orderGraph(title) {
    //Get transactions graph
    sendData({}, "/orderGraph", (res) => {
        console.log(res)
        let result = JSON.parse(res);
        console.log(result);
        var buyData = result.Buy;
        console.log(buyData)
        let curBarOptions = JSON.parse(JSON.stringify(barOptions));
        console.log(Object.keys(buyData))
        barData.data.labels = Object.keys(buyData);
        barData.data.datasets[0].data = Object.values(buyData);
        curBarOptions.data = barData.data
        curBarOptions.options.indexAxis =  "x"
        curBarOptions.options.plugins.title.text = title;
        new Chart($("#tab2_graph"), curBarOptions);
        console.log(curBarOptions);
    })

}
function inventoryGraph(title) {
    sendData({}, "/getInventoryGraph", (res) => {
        console.log(res)
        let result = JSON.parse(res);
        console.log(result);
        let data = {};
        result.map(element => {
            data[element.product_name] = element.quantity
        })
        // var buyData = result.Buy;
        // console.log(buyData)
        let curBarOptions = JSON.parse(JSON.stringify(barOptions));
        curBarOptions.options.indexAxis =  "y"
        barData.data.labels = Object.keys(data);
        barData.data.datasets[0].data = Object.values(data);
        curBarOptions.data = barData.data
        curBarOptions.options.plugins.title.text = title;
        new Chart($("#tab3_graph"), curBarOptions);
        console.log(curBarOptions);
    })

 }
function checkEMP() {
    //Get employee designation
    return
}

function drawBarChart(data, title, element){
    barData.data.datasets[0].data = Object.values(data);
    barData.data.labels = Object.keys(data)
    barOptions.data = barData.data
    barOptions.options.plugins.title.text = title;
    console.log(barOptions);
    return new Chart($("#"+element), barOptions);
}

function drawPieChart(data, title, element) {
    pieData.data.datasets[0].data = Object.values(data);
    pieData.data.labels = Object.keys(data)
    pieOptions.data = pieData.data
    pieOptions.options.plugins.title.text = title;
    console.log(pieOptions);
    return new Chart($("#"+element), pieOptions);
    
}

function drawLineChart(data, title, element) {
    lineData.data.datasets[0].data = data.output;
    lineData.data.datasets[0].label = data.output_label;
    lineData.data.datasets[1].data = data.actual;
    lineData.data.datasets[1].label = data.actual_label;
    labels = []
    let max1 = data.output.reduce(function(a,b){ return Math.max(a,b)})// * 1.1
    let max2 = data.actual.reduce(function(a,b){ return Math.max(a,b)})// * 1.1
    max1 = Math.max(max1, max2) * 1.025
    let min1 = data.output.reduce(function(a,b){ return Math.min(a,b)})// * 1.1
    let min2 = data.actual.reduce(function(a,b){ return Math.min(a,b)})// * 1.1
    min1 = Math.min(min1, min2) * 0.975
    var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
    let today = new Date()
    for (let index = -10; index <= data.output.length - 10; index++) {
        // console.log(index * 86400000);
        let index_data = new Date(today - (index * 86400000));
        labels.push(index_data.getDate()+"-"+(months[index_data.getMonth()]));
    }
    lineData.data.labels = labels.reverse();
    lineOptions.options.plugins.title.text = title;
    // lineOptions.options.scales.yAxes = [] 
    console.log(max1, min1)
    lineOptions.options.scales.yAxis.max = max1 
    lineOptions.options.scales.yAxis.min = min1 
    lineOptions.data = lineData.data;
    console.log(lineOptions);
    return new Chart($("#"+element), lineOptions);
}
