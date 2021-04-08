$(document).ready(() => {
    $.get("/user/", (res) => {
        if (res) { 
            $("#status").text("Logged in as " + res);
        } else {
            $("#status").text("Not logged in!");
        }
    });
});

$("#logout").click(() => {
    $.post("/logout/", (res) => {
        window.location.reload();
    })
})