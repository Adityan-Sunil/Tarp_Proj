var position = "#registerView";

$(document).ready(() => {
    changeTextColor(0);
    const now = new Date().toISOString().substr(0, 10);
    $("input[type=date]").each((i, el) => {
        el.value = now;
    });
    $(".viewContent").each((i, el) => {
        $(el).hide();
        $(el).addClass("hiddenContent");
    });

    $(position).show();
    $(position).addClass("visibleContent");
    $(position).removeClass("hiddenContent");
})


$("#registerBtn").click(() => {
    if (position == "#registerForm") return;
    $("#slidingBG").removeClass("slideMiddle slideRight");
    $("#slidingBG").addClass("slideLeft");
    changeTextColor(0);
    $(position).addClass("hiddenContent");
    $(position).removeClass("visibleContent");
    const prevPosition = position;
    setTimeout(() => {
        $(prevPosition).hide();
        $("#registerView").show();
        $("#registerView").addClass("visibleContent");
        $("#registerView").removeClass("hiddenContent");
    }, 500);
    position = "#registerView";

});

$("#complaintBtn").click(() => {
    if (position == "#complaintSelectView") return;
    $("#slidingBG").removeClass("slideLeft slideRight");
    $("#slidingBG").addClass("slideMiddle");
    changeTextColor(1);
    $(position).addClass("hiddenContent");
    $(position).removeClass("visibleContent");
    const prevPosition = position;

    $("#complaintViewTable").html("");
    $.post("/fetch_tickets_by_reg/", (res) => {
        console.log(res);
        for (const ticket of res) {
            addToView(ticket, "#complaintViewTable");
        }
        $(".tableRow").click(function () {
            viewTicket(this.id);
        })
    });

    setTimeout(() => {
        $(prevPosition).hide();
        $("#complaintSelectView").show();
        $("#complaintSelectView").addClass("visibleContent");
        $("#complaintSelectView").removeClass("hiddenContent");
    }, 500);
    position = "#complaintSelectView";
});

$("#complaintBack").click(() => {
    $("#complaintBtn").click();
})

$("#modifyBtn").click(() => {
    if (position == "#modifySelectView") return;
    $("#slidingBG").removeClass("slideMiddle slideLeft");
    $("#slidingBG").addClass("slideRight");
    changeTextColor(2);
    $(position).addClass("hiddenContent");
    $(position).removeClass("visibleContent");
    const prevPosition = position;

    $("#modifyViewTable").html("");
    $.post("/fetch_tickets_by_reg/", (res) => {
        for (const ticket of res) {
            if (ticket.last_update_status != "Closed") {
                addToView(ticket, "#modifyViewTable");
            }
        }
        $(".tableRow").click(function () {
            modifyTicket(this.id);
        })
    });

    setTimeout(() => {
        $(prevPosition).hide();
        $("#modifySelectView").show();
        $("#modifySelectView").addClass("visibleContent");
        $("#modifySelectView").removeClass("hiddenContent");
    }, 500);
    position = "#modifySelectView";
});

function viewTicket(ticketID) {
    if (position == "#complaintView") return;
    $(position).addClass("hiddenContent");
    $(position).removeClass("visibleContent");
    const prevPosition = position;
    setTimeout(() => {
        $(prevPosition).hide();
        $("#complaintView").show();
        $("#complaintView").addClass("visibleContent");
        $("#complaintView").removeClass("hiddenContent");
    }, 500);
    position = "#complaintView";

    $.post("/fetch_ticket_by_id/", {service_id: ticketID}, (res) => {
        if (res && res != "reject") {
            console.log(res);
            const regDate = new Date(res.registered_on);
            const lastUpd = new Date(res.last_update);
            const deadline = new Date(res.deadline);
            var overseer = res.emp_id;
            if (!overseer) {
                overseer = "None";
                res.update_message = "N/A";
            }
            $("#complaintTitle").text(res.title);
            $("#complaintID").text(res.service_id);
            $("#complaintRegDate").text(regDate.getDate() + "-" + (regDate.getMonth() + 1) + "-" + regDate.getFullYear());
            $("#complaintUpdDate").text(lastUpd.getDate() + "-" + (lastUpd.getMonth() + 1) + "-" + lastUpd.getFullYear());
            $("#complaintDeadline").text(deadline.getDate() + "-" + (deadline.getMonth() + 1) + "-" + deadline.getFullYear());
            $("#complaintEmployee").text(overseer);
            $("#complaintStatus").text(res.last_update_status);
            $("#complaintDescription").text(res.description);
            $("#complaintResponse").text(res.update_message);
        } else {
            console.log(res);
        }
    })
}

function modifyTicket(ticketID) {
    if (position == "#modifyView") return;
    $(position).addClass("hiddenContent");
    $(position).removeClass("visibleContent");
    const prevPosition = position;
    setTimeout(() => {
        $(prevPosition).hide();
        $("#modifyView").show();
        $("#modifyView").addClass("visibleContent");
        $("#modifyView").removeClass("hiddenContent");
    }, 500);
    position = "#modifyView";

    $.post("/fetch_ticket_by_id/", {service_id: ticketID}, (res) => {
        if (res && res != "reject") {
            console.log(res);
            const regDate = new Date(res.registered_on);
            const lastUpd = new Date(res.last_update);
            const deadline = new Date(res.deadline);
            var overseer = res.emp_id;
            if (!overseer || overseer == "") {
                overseer = "None";
                res.update_message = "N/A";
            }
            $("#modifyTitle").val(res.title);
            $("#modifyID").text(res.service_id);
            $("#modifyRegDate").value = regDate;
            $("#modifyUpdDate").text(lastUpd.getDate() + "-" + (lastUpd.getMonth() + 1) + "-" + lastUpd.getFullYear());
            $("#modifyDeadline").value = deadline;
            $("#modifyEmployee").text(overseer);
            $("#modifyStatus").val(res.last_update_status);
            $("#modifyDescription").val(res.description);
            $("#modifyResponse").text(res.update_message);
        } else {
            console.log(res);
        }
    })
}

$("#registerSubmit").click(() => {
    postFormContent("/add_ticket/", $("#registerForm"), (res) => {
        if (res == "reject") {
            console.log("something went wrong");
        } else {
            const now = new Date();
            $("input[type=date]").each((i, el) => {
                el.value = now;
            });
            $("#status").val("Open");
            $("#title").val("");
            $("#description").val("");
            viewTicket(res.service_id);
        }
    })
})

$("#modifySubmit").click(() => {
    postFormContent("/modify_ticket/", $("#modifyForm"), (res) => {
        if (res == "reject") {
            console.log("something went wrong");
        } else {
            viewTicket(res.service_id);
        }
    }, {service_id: $("#modifyID").text()})
});

$("#modifyBack").click(() => {
    $("#modifyBtn").click();
})

function changeTextColor(blackInd) {
    $(".viewSelectBtn").each((i, el) => {
        el.style.color = "white";
    });
    $(".viewSelectBtn")[blackInd].style.color = "black";
}

function postFormContent(route, form, callback, extras = {}) {
    const nonJSONRes = $(form).serializeArray();
    var JSONRes = {};
    $.map(nonJSONRes, (field) => {
        JSONRes[field.name] = field.value;
    });
    for (const fieldName in extras) {
        JSONRes[fieldName] = extras[fieldName];
    }
    console.log(JSONRes);
    $.ajax({
        url: route,
        type: "POST",
        data: JSON.stringify(JSONRes),
        contentType: "application/json; charset=utf-8",
        success: callback
    });
}

function addToView(ticket, table) {
    console.log(ticket);
    const regDate = new Date(ticket.registered_on);
    const lastUpd = new Date(ticket.last_update);
    $(table).append(`
    <div class="row text-center tableRow mx-0" id=` + ticket.service_id + `>
        <div class="col-4 tableCell">
            ` + ticket.service_id + `
        </div>
        <div class="col-4 tableCell">
            ` + ticket.title + `
        </div>
        <div class="col-2 tableCell">
            ` + regDate.getDate() + "-" + (regDate.getMonth() + 1) + "-" + regDate.getFullYear() + `
        </div>
        <div class="col-2 tableCell">
            ` + lastUpd.getDate() + "-" + (lastUpd.getMonth() + 1) + "-" + lastUpd.getFullYear() + `
        </div>
    </div>
    `);
}