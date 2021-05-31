var ctx = $("#chart");

function addtoGraph(type,element, data, title){
    if(type === 'doughnut'){
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
                },
                plugins:{
                    title:{
                        display:true,
                        text: title,
                        font:{
                            size:18
                        }
                    }
                }
            }
        })
    } else if (type === 'bar'){
        new Chart($("#" + element), {
            type:'bar',
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
                },
                options:{
                    maintainAspectRatio: false,
                    responsive: true,
                    layout:{
                        padding:0
                    },
                    plugins:{
                        title:{
                            display:true,
                            text: title,
                            font:{
                                size:18
                            }
                        }
                    }
                }
            },

        )
    }
}