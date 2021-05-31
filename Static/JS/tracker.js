let designation;
let company = "81afb988-db90-4fd2-b0df-d22ee39406b5";
let data  ={}; 
let title = "Title"

let pieData = {
    data :{
        labels:Object.keys(data),
        datasets:[{
            circumference:180,
            rotation: -90,
            data: Object.values(data),
            radius:'50%',
            backgroundColor:[
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
            ], 
            hoverOffset: 4,
        }]
    },
}

let barData = {
    data: {
        labels:Object.keys(data),
        datasets:[{
            data:Object.values(data),
            backgroundColor:[
                'rgb(255, 99, 132)',
                'rgb(54, 162, 235)',
            ], 
            hoverOffset: 4,
        }]
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

let barOptions = {
    type:"bar",
    options:{
        maintainAspectRatio: false,
        responsive: true,
        layout:{
            padding:0
        },
        plugins:{
            title:{
                display:true,
                text: "Transactions",
                font:{
                    size:18
                }
            }
        }
    }
}

function customerGraph(){
    //Post service_graph
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
    })
    pieOptions.data = pieData.data;
    //Get customer service graph
    new Chart($("#tab1_graph"), pieOptions)
    console.log(pieOptions);
}
function orderGraph() {
    //Get transactions graph
    sendData({company:company}, "/orderGraph", (res) => {
        console.log(res)
        let result = JSON.parse(res);
        console.log(result);
        var buyData = result.Buy;
        console.log(buyData)
        barData.data.labels = Object.keys(buyData);
        barData.data.datasets[0].data = Object.values(buyData);
        barOptions.data = barData.data
        new Chart($("#tab2_graph"), barOptions);
        console.log(barOptions);
    })

}
function targetGraph() {
    //Get target achieved graph
 }
function checkEMP() {
    //Get employee designation
    return
 }