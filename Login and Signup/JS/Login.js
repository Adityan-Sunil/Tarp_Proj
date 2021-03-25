var login = true;
$(document).ready(() => {
    $("#signupForm").hide();
});

$("#loginBtn").click(() => {
    var nonJSONRes = $("#loginForm").serializeArray();
    var JSONRes = {};
    $.map(nonJSONRes, (field) => {
        JSONRes[field.name] = field.value;
    });
    $.ajax({
        url: '/login/',
        type: 'POST',
        data: JSON.stringify(JSONRes),
        contentType: 'application/json; charset=utf-8',
        success: (res) => {
            console.log(res);
            if (res == "accept") {
                window.location = "checklogin.html";
            }
        }
    });
});

$("#signupBtn").click(() => {
    var nonJSONRes = $("#signupForm").serializeArray();
    var JSONRes = {};
    $.map(nonJSONRes, (field) => {
        JSONRes[field.name] = field.value;
    });
    if (JSONRes.pwd == JSONRes.confirmPwd) {
        $.ajax({
            url: '/signup/',
            type: 'POST',
            data: JSON.stringify(JSONRes),
            contentType: 'application/json; charset=utf-8',
            success: (res) => {
                console.log(res);
                if (res == "accept") {
                    window.location = "checklogin.html";
                }
            }
        });
    }
});

function switchToSignup() {
    if (login) {
        slideBG();
        login = false;
        toggleTransparent($("#loginForm"));
        setTimeout(() => {
            $("#loginForm").hide();
            $("#signupForm").show();
            toggleTransparent($("#signupForm"));
        }, 500);
    }
}

function switchToLogin() {
    if (!login) {
        slideBG();
        login = true;
        toggleTransparent($("#signupForm"));
        setTimeout(() =>  {
            $("#signupForm").hide();
            $("#loginForm").show();
            toggleTransparent($("#loginForm"));
        }, 500);
    }
}

function slideBG() {
    $("#slidingBG").toggleClass("slideLeft");
    $("#slidingBG").toggleClass("slideRight");
}

function toggleTransparent(el) {
    $(el).toggleClass("vis");
    $(el).toggleClass("transp");
}
