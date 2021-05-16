// $(document).ready(() => {
//     $.get("/user/", (res) => {
//         if (res) {
//             var details = "Logged in with the details: <br>";
//             for (var detail in res) {
//                 details += detail + ": " + res[detail] + "<br>";
//             } 
//             $("#status").html(details);
//         } else {
//             $("#status").html("Not logged in!");
//         }
//     });
// });
var userDetails;

$("#logout").click(() => {
    $.post("/logout/", (res) => {
        window.location.reload();
    })
})

$(document).ready(verifyLogIn);

function verifyLogIn() {
    $.get("/user/", (res) => {
        if (res) {
            userDetails = res;
        } else {
            window.location = "Login.html";
        }
        
    })
}