$.each($(".tracker-tab-content"), function () { 
    $(this).css({"width": "100%",  "height": "100%"});
    $(this).hide();
});

$("#customer").show();
$("#customer").css("width","100%");
customerGraph("Service Calls Closed Status");
orderGraph("Orders");
inventoryGraph("Inventory Status")
// testModel();
// function toggleTab(e, th){
//     console.log(th.dataset.toggle);
//     e.preventDefault();
//     $.each($(".tracker-tab-content"), function () { 
//         $(this).css("width", "10%", "height", "10%");
//         $(this).hide();
//     });
//     $("#"+th.dataset.toggle).show();
//     $("#"+th.dataset.toggle).css({"width": "100%",  "height": "100%"});
//     callFunction(th.dataset.toggle);    
// }

// function callFunction(elementName) {
//     switch (elementName) {
//         case "customer":
//             customerGraph("Service Calls Closed Status")
//             break;
//         case "orders":
//             orderGraph("Orders")
//             break;
//         default:
//             break;
//     }
// }

function testModel() {
    sendData({symbol:"IDFC"}, "http://192.168.1.3:5000/stockprice", (res) =>{
        console.log(res);
    })
}