var ctx = $("#chart");
// var chart = new Chart( ctx,{
//     type:'doughnut',
//     data: {
//         labels: ['Completed', 'Pending'],
//         datasets:[{
//             label:'Transaction Status',
//             circumference: 180,
//             radius: '50%',
//             rotation: -90,
//             data: [300, 600],
//             backgroundColor:[
//                 'rgb(255, 99, 132)',
//                 'rgb(54, 162, 235)',
//             ], 
//             hoverOffset: 4,
//             animateScale: true
//         }]
//     },
//     options:{
//         maintainAspectRatio:false,
//         responsive:true
//     }
// } )
function addtoGraph(element, data){
    new Chart($("#" + element), {
        type:'doughnut',
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
        options:{
            maintainAspectRatio: false,
            responsive: true,
            layout:{
                padding:0
            }
        }
    })
}