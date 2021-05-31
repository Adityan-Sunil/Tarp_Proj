let primaryView = "#myComplaintsContent";
let secondaryView = "#openComplaintsSelect";

$(document).ready(() => {
    $("#closedComplaintsSelect").hide();
    $("#closedComplaintsView").hide();
    $("#openComplaintsView").hide();
    $("#newComplaintsContent").hide();
    loadOpenComplaints();
    // loadNewComplaints();
});

$("#openComplaintsBtn").click(() => {
    if (secondaryView == "#openComplaintsSelect") return;
    $("#slidingBG").removeClass("slideRight");
    $("#slidingBG").addClass("slideLeft");
    $("#openComplaintsBtn").addClass("blackText");
    $("#closedComplaintsBtn").removeClass("blackText");

    hideContent(secondaryView);
    loadOpenComplaints(() => {
        showContent("#openComplaintsSelect");
    });
    
    secondaryView = "#openComplaintsSelect";

});

$("#closedComplaintsBtn").click(() => {
    if (secondaryView == "#closedComplaintsSelect") return;
    $("#slidingBG").removeClass("slideLeft");
    $("#slidingBG").addClass("slideRight");
    $("#closedComplaintsBtn").addClass("blackText");
    $("#openComplaintsBtn").removeClass("blackText");
    hideContent(secondaryView);
    loadClosedComplaints(() => {
        showContent("#closedComplaintsSelect");
    })

    secondaryView = "#closedComplaintsSelect";
});

$("#myComplaintsBtn").click(() => {
    if (primaryView == "myComplaintsContent") return;
    $("#myComplaintsBtn").addClass("selected");
    $("#newComplaintsBtn").removeClass("selected");

    hideContent(primaryView);
    showContent("#myComplaintsContent");

    primaryView = "#myComplaintsContent";
});

$("#newComplaintsBtn").click(() => {
    if (primaryView == "newComplaintsContent") return;
    $("#newComplaintsBtn").addClass("selected");
    $("#myComplaintsBtn").removeClass("selected");
    hideContent(primaryView);
    loadNewComplaints(() => {
        showContent("#newComplaintsContent");
    });
    //showContent("#newComplaintsContent");

    primaryView = "#newComplaintsContent";
})

function hideContent(content) {
    $(content).removeClass("visibleContent");
    $(content).addClass("hiddenContent");
    setTimeout(() => {
        $(content).hide();
    }, 500)
}

function showContent(content) {
    setTimeout(() => {
        $(content).show();
        $(content).removeClass("hiddenContent");
        $(content).addClass("visibleContent");
    }, 500);
    
}

function loadOpenComplaints(callback = null) {
    console.log("kek");
    $.post("/fetch_tickets_by_emp/", (res) => {
        console.log(res);
        $("#openComplaintsViewTable").html("");
        console.log("cleared");
        for (const ticket of res) {
            if (ticket.closed) continue;
            const deadline = new Date(ticket.deadline);
            $("#openComplaintsViewTable").append(`
                <div class="row text-center tableRow mx-0" id=` + ticket.service_id + `>
                    <div class="col-5 tableCell">
                        ` + ticket.service_id + `
                    </div>
                    <div class="col-3 tableCell">
                        ` + ticket.title + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + deadline.getDate() + "-" + (deadline.getMonth() + 1) + "-" + deadline.getFullYear() + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + ticket.last_update_status + `
                    </div>
                </div>   
            `);
        }
        $("#openComplaintsViewTable .tableRow").click((event) => {
            updateTicket($(event.target).closest(".tableRow").attr("id"))
        });
        if (callback) callback();
    });
}

function loadClosedComplaints(callback = null) {
    console.log("kek");
    $.post("/fetch_tickets_by_emp/", (res) => {
        console.log(res);
        $("#closedComplaintsViewTable").html("");
        console.log("cleared");
        for (const ticket of res) {
            if (!ticket.closed) continue;
            const updDate = new Date(ticket.last_update);
            const regDate = new Date(ticket.registered_on);
            $("#closedComplaintsViewTable").append(`
                <div class="row text-center tableRow mx-0" id=` + ticket.service_id + `>
                    <div class="col-5 tableCell">
                        ` + ticket.service_id + `
                    </div>
                    <div class="col-3 tableCell">
                        ` + ticket.title + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + regDate.getDate() + "-" + (regDate.getMonth() + 1) + "-" + regDate.getFullYear() + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + updDate.getDate() + "-" + (updDate.getMonth() + 1) + "-" + updDate.getFullYear() + `
                    </div>
                </div>   
            `);
        }
        $("#closedComplaintsViewTable .tableRow").click((event) => {
            viewTicket($(event.target).closest(".tableRow").attr("id"))
        });
        if (callback) callback();
    });
}

function loadNewComplaints(callback = null) {
    $.post("/fetch_unassigned_tickets/", (res) => {
        console.log(res);
        $("#newComplaintsViewTable").html("")
        for (const ticket of res) {
            if (ticket.closed) continue;
            const deadline = new Date(ticket.deadline);
            const regDate = new Date(ticket.registered_on);
            $("#newComplaintsViewTable").append(`
                <div class="row text-center tableRow mx-0" id=` + ticket.service_id + `>
                    <div class="col-5 tableCell">
                        ` + ticket.service_id + `
                    </div>
                    <div class="col-3 tableCell">
                        ` + ticket.title + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + deadline.getDate() + "-" + (deadline.getMonth() + 1) + "-" + deadline.getFullYear() + `
                    </div>
                    <div class="col-2 tableCell">
                        ` + ticket.last_update_status + `
                    </div>
                    <div class="container-fluid expandableContent">
                        <div class="row">
                            <div class="col-2 tableCell text-right">
                                Description: 
                            </div>
                            <div class="col-4 tableCell">
                                <p>` + ticket.description + `</p>
                            </div>
                            <div class="col-2 tableCell text-right">
                                Registered on: 
                            </div>
                            <div class="col-2 tableCell">
                                ` + regDate.getDate() + "-" + (regDate.getMonth() + 1) + "-" + regDate.getFullYear() + `
                            </div>
                            <div class="col-2 tableCell">
                                <button class="tableBtn" onclick="claimTicket('` + ticket.service_id + `')">Claim Ticket</button>
                            </div>
                        </div>
                    </div>
                </div>   
            `);
        }
        $("#newComplaintsViewTable .tableRow").click((event) => {
            const expandableContent = $(event.target).closest(".tableRow").find(".expandableContent");
            if (!$(expandableContent).hasClass("expanded")) {
                $(".expanded").removeClass("expanded");
                $(".highlighted").removeClass("highlighted");
            }   
            $(expandableContent).toggleClass("expanded");
            $(expandableContent).closest(".tableRow").toggleClass("highlighted");
        });
        console.log("done");
        if (callback) callback();
    });
}

function claimTicket(ticketID) {
    $.post("/claim_ticket/", {ticket: ticketID}, (res, err) => {
        console.log(res);
        console.log(err);
        $("#myComplaintsBtn").click();
        updateTicket(ticketID);
    });
}

function updateTicket(ticketID) {
    if (secondaryView == "#openComplaintsView") return;
    hideContent(secondaryView);
    $.post("/fetch_ticket_by_id/", {service_id: ticketID}, (res) => {
        console.log(res);
        const regDate = new Date(res.registered_on);
        const lastUpd = new Date(res.last_update);
        const deadline = new Date(res.deadline);
        var postedBy = res.reg_id;
        $("#updateTitle").text(res.title);
        $("#updateID").text(res.service_id);
        $("#updateRegDate").text(regDate.getDate() + "-" + (regDate.getMonth() + 1) + "-" + regDate.getFullYear());
        $("#updateUpdDate").text(lastUpd.getDate() + "-" + (lastUpd.getMonth() + 1) + "-" + lastUpd.getFullYear());
        $("#updateDeadline").text(deadline.getDate() + "-" + (deadline.getMonth() + 1) + "-" + deadline.getFullYear());
        $("#updateEmployee").text(postedBy);
        $("#updateStatus").val(res.last_update_status);
        $("#updateDescription").text(res.description);
        $("#updateResponse").val(res.update_message);
        showContent("#openComplaintsView");
    })
    secondaryView = "#openComplaintsView";
}

$("#updateSubmit").click(() => {
    const nonJSONRes = $("#updateForm").serializeArray();
    var JSONRes = {};
    $.map(nonJSONRes, (field) => {
        JSONRes[field.name] = field.value;
    });
    JSONRes["service_id"] = $("#updateID").text();
    console.log(JSONRes);
    $.post("/update_ticket/", JSONRes, (res) => {
        viewTicket(res.service_id);
    })
});

$("#updateBack").click(() => {
    $("#openComplaintsBtn").click();
})

function viewTicket(ticketID) {
    if (secondaryView == "#closedComplaintsView") return;
    hideContent(secondaryView);
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
            showContent("#closedComplaintsView");
        } else {
            console.log(res);
        }
    });
    secondaryView = "#closedComplaintsView";
}

$("#complaintBack").click(() => {
    if ($("#complaintStatus").text() == "Closed") {
        $("#closedComplaintsBtn").click();
    } else {
        $("#openComplaintsBtn").click();
    }
})