$(document).ready(function () {
    //call url
    $("#tweets").html(`<div class="content-header">Tweet Analysis</div>`);
    sendData({n:5}, "http://192.168.1.3:5000/getntweet", (result) =>{
        console.log(result)
        let ress = JSON.parse(result);
        console.log(ress);
        for (let i = 0; i < ress.content.length; i++) {
            const res = {content:ress.content[i], id:ress.id[i], url:ress.url[i]}
            console.log(res);
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

        }
    },false);
    //testModel();
   // testNtweets()
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

function testNtweets() {
    sendData({n:5}, "http://192.168.1.3:5000/getntweet", (res) =>{
        console.log(res);
        console.log(JSON.parse(res));
    })
}