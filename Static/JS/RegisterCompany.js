let view = "#forms";

$(document).ready(() => {
    $(".hiddenContent").hide();
    $(".opc").hide();
});

$("#formBtn").click(() => {
    if (view == "#forms") return;
    $("#slidingBG").removeClass("slideRight");
    $("#slidingBG").addClass("slideLeft");
    $("#formBtn").addClass("blackText");
    $("#certificateBtn").removeClass("blackText");
    hideContent(view);
    showContent("#forms");
    view = "#forms";
});

$("#certificateBtn").click(() => {
    if (view == "#certificates") return;
    $("#slidingBG").removeClass("slideLeft");
    $("#slidingBG").addClass("slideRight");
    $("#certificateBtn").addClass("blackText");
    $("#formBtn").removeClass("blackText");
    hideContent(view);
    showContent("#certificates");
    view = "#certificates";
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

$("#opcSelect").change(() => {
    if ($("#opcSelect").find(":selected").val() == "no") {
        $(".opc").hide();
        $(".non-opc").show();
    } else {
        $(".non-opc").hide();
        $(".opc").show();
    }
})