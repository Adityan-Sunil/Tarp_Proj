$.each($(".page-content-display"), function (indexInArray) { 
     $(this).hide();
});
var activeNavBtn = $(".nav-items-active-btn")[0];
var activeContent = "#content1";
$(activeContent).show();
function switchContent(event ,element) {
    event.preventDefault();
    $(activeNavBtn).toggleClass("nav-items-active-btn");
    $(element).toggleClass("nav-items-active-btn");
    activeNavBtn = $(element);
    $(activeContent).hide();
    $(element.dataset.toggle).show();
    activeContent = element.dataset.toggle;
}

