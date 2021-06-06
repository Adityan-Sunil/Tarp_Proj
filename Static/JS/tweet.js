$(document).ready(function () {
    //call url
    $("#tweets").html(`<div class="content-header">Tweet Analysis</div>`);
    sendData({}, "http://192.168.1.3:5000/gettweet", (result) =>{
        console.log(result)
        let res = JSON.parse(result);

        sendData({tweet:res.content}, "http://192.168.1.3:5000/predict", (sent) => {
            let sentiment = JSON.parse(sent).output;
            console.log(sentiment);
            let rating
            if(sentiment < 0.3) {
                rating = 'bad'
            } else if (sentiment >= 0.5) {
                rating = 'good'
            } else {
                rating = 'ok';
            }
            $("#tweets").append(`
                <div class="tweet">
                    <div class="tweet-head tweet-content">${res.id} <div class="${rating} tweet-sentiment"></div></div>
                    <div class="tweet-body tweet-content">${res.content}</div>
                    <div class="tweet-link tweet-content">${res.url}</div>
                </div>
            `)
        })
    },false);
    //testModel();
});
let cChart = undefined;
function testModel() {
    let symbol = $("#stock-symbol").val();
    sendData({symbol:symbol}, "http://192.168.1.3:5000/stockprice", (res) =>{
        console.log(res);
        let result = JSON.parse(res);
        console.log(result.output);
        result.output_label ="Prediction"
        result.actual_label = "Actual" 
        if(cChart !== undefined) {
            cChart.destroy();
            cChart = undefined;
        }
        cChart = drawLineChart(result, "Stock Prediction", "stocksModel")
    })
}