const express = require("express");
const path = require("path");
const app = express();
const port = process.env.PORT || "8000";
app.use(express.static(__dirname + "/public"));
app.get('/',function(req,res){
    app.engine('html', require('ejs').renderFile);
    res.render('invoice.html');
  });
  app.get('/upload',function(req,res){
    app.engine('html', require('ejs').renderFile);
    res.render('upload.html');
  });

app.listen(port, () => {
    console.log(`Listening to requests on http://localhost:${port}`);
});