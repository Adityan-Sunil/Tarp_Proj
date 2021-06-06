let leave_chart = undefined;
let service_chart = undefined;
$.each($(".tracker-tab-content"), function () { 
    $(this).css({"width": "100%",  "height": "100%"});
    $(this).hide();
});

$("#customer").show();
$("#customer").css("width","100%");
customerGraph("Service Calls Closed Status");
orderGraph("Orders");
inventoryGraph("Inventory Status")
leaveData("Leaves")
personalService("Targets")

function leaveData(title) {
    sendData({}, "/emp_salary", (result) => {
        console.log(result);
        let res = JSON.parse(result)[0];
        let data = {}
        console.log(res);
        data["Paid Leaves Taken"] = res.paid_leave;
        data["Paid Leaves Available"] = Math.max(res.paid_leave - res.leave_days, 0)
        console.log(data);
        if(leave_chart !== undefined) {
            leave_chart.destroy();
        }
        leave_chart = drawPieChart(data, title, "tab4_graph")
    })
}

function personalService(title) {
    sendData({}, "/fetch_tickets_by_emp", (results) => {
        var data_res = JSON.parse(results);
        console.log(data_res);
        data = {Closed:0, Open:0}
        data_res.forEach(element => {
            if(element.closed) {
                data.Closed++;
            } else {
                data.Open++;
            }
        });
        console.log(data);
        if(service_chart !== undefined) {
            service_chart.destroy()
        }
        service_chart = drawPieChart(data, title, "tab5_graph");
    })
}