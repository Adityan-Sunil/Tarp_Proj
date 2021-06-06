var login = true;
$(document).ready(() => {
    $("#signupForm").hide();
});
$(".toggleBtn")[0].style.color = "black";
$(".toggleBtn")[1].style.color = "white";
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
                window.location = "index.html";
            }
        }
    });
});

$("#signupBtn").click(() => {
    var nonJSONRes = $("#signupForm").serializeArray();
    var JSONRes = {company: {}, user: {}};
    $.map(nonJSONRes, (field) => {
        if (field.name.startsWith("company")) {
            JSONRes.company[field.name.substr(8)] = field.value
        } else {
            JSONRes.user[field.name] = field.value
        }
    });
    if (JSONRes.pwd == JSONRes.confirmPwd) {
        $.ajax({
            url: '/register_company/',
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

function switchToSignup(e) {
    e.style.color = "black";
    $('.toggleBtn').each(function(){
        if(this !== e){
            this.style.color = "white";
        }
    })
    if (login) {
        slideBG();
        login = false;
        toggleTransparent($("#loginForm"));
        $("#inputContainer").toggleClass("shortHeight");
        $("#inputContainer").toggleClass("longHeight");
        setTimeout(() => {
            $("#loginForm").hide();
            $("#signupForm").show();
            toggleTransparent($("#signupForm"));
        }, 500);
    }
}

function switchToLogin(e) {
    $('.toggleBtn').each(function(){
        if(this !== e){
            this.style.color = "white";
        }
    })
    e.style.color = "black";
    if (!login) {
        slideBG();
        login = true;
        toggleTransparent($("#signupForm"));
        $("#inputContainer").toggleClass("shortHeight");
        $("#inputContainer").toggleClass("longHeight");
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
