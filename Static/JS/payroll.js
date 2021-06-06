var charts ={
    "tracker1": undefined, 
    "tracker2": undefined
}
function closeModal(e) {
    console.log("close");
    e.preventDefault();
    $("#emp-modal").hide();
}
$("#emp-modal").hide();

sendData({data:"no"},"/salarydet", (res) => {
    console.log(res);
    var result = JSON.parse(res);
    console.log(result);
    $("#emp-table").html(
        '<div class="table-head table-row"><div class="table-cell">Employee Name</div><div class="table-cell">Paygrade</div><div class="table-cell">Designation</div><div class="table-cell">Current Salary</div></div>')
    result.forEach(element => {
        $("#emp-table").append(
            `
            <div class="table-row" data-id="${element.emp_id}" onclick=loadEmployee(this)>
                <div class="table-cell table-row-data">${element.emp_name}</div>
                <div class="table-cell table-row-data">${element.paygrade}</div>
                <div class="table-cell table-row-data">${element.emp_designation}</div>
                <div class="table-cell table-row-data">${element.current_sal}</div>
            </div>
            `
        )
    });
})

function loadEmployee(th) {
    $("#emp-modal").show();
    var id = th.dataset.id;
    console.log(id);
    sendData({id:id}, "/salary_with_date", (result) => {
        console.log(result);
        var res = JSON.parse(result);
        console.log(res);
        console.log(res[0].emp_name)
        console.log($("#general>div>span.general-det-data"));
        $("#general>div>span#name").text(`${res[0].emp_name}`);
        $("#general>div>span#dept").text(`${res[0].emp_designation}`);
        $("#general>div>span#jdate").text(`${(res[0].emp_joindate).split("T")[0]}`);
        $("#general>div>span#paygrade").text(`${res[0].paygrade}`);
        $("#general>div>span#sal").text(`${res[0].current_sal}`);
        if(res[0].emp_designation === "Service")
        sendData({id:id}, "/fetch_tickets_by_emp_perf", (result) => {
            console.log(result);
            let tickets = JSON.parse(result);
            let claimed = tickets.length
            let open = 0;
            tickets.forEach(ticket => {
                if(ticket.closed === false) {
                    open++;
                }
            });
            $("#perfomance-goal").siblings().text("Tickets Claimed")
            $("#perfomance-goal").text(`${claimed}`)
            $("#perfomance-achieved").siblings().text("Tickets Closed")
            $("#perfomance-achieved").text(`${claimed - open}`)
            if(charts.tracker1 !== undefined){ 
                charts.tracker1.destroy();
                charts.tracker1 = undefined
            }
            charts.tracker1 = drawPieChart({open:open, closed:claimed - open}, "Service Ticket Status", "tracker1")
        })
    })
    sendData({id:id}, "/monthsalary", (result) => {
        console.log(result);
        let parsed_result = JSON.parse(result)[0]
        console.log(parsed_result);
        $("#perfomance-leave").text(`${parsed_result.leave_days}`)
        $("#perfomance-paid").text(`${parsed_result.paid_leave}`)
        $("#perfomance-sal").text(`${parsed_result.salary}`)
        $("#perfomance-extra").text(`${parsed_result.extra_hours}`)
        if(charts.tracker2 !== undefined){ 
            charts.tracker2.destroy();
            charts.tracker2 = undefined
        }
        charts.tracker2 = drawPieChart({paid_leave:parsed_result.paid_leave, unpaid_leaves:parsed_result.leave_days - parsed_result.paid_leave}, "Leave Status", "tracker2")
    })
}