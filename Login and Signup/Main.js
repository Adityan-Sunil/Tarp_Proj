require("dotenv").config();

const express = require("express");
const app = express();

const bodyParser = require("body-parser");
app.use(bodyParser.json());

const session = require("express-session");
const cookieParser = require("cookie-parser");
app.use(cookieParser());
app.use(session({
    secret: "123456",
    saveUninitialized: false,
    resave: true
}));

const pg = require("pg");
const db = new pg.Client({
    connectionString: process.env.DATABASE_URL,
    ssl: {rejectUnauthorized: false}
});
db.connect();



app.use(express.static("HTML"));
app.use(express.static("CSS"));
app.use(express.static("JS"));



app.post("/login/", (req, res) => {
    const user = req.body;
    console.log(user);
    db.query("SELECT COUNT(*) FROM userInfo WHERE email = $1 AND pwd = $2", [user.email, user.pwd], (err, result) => {
        if (err) {
            console.log(err);
            res.send("reject");
            throw err;
        }
        if (result.rows[0].count == 1) {
            req.session.user = user.email;
            console.log(result.rows);
            res.send("accept");
        } else {
            res.send("reject");
        }
    })
});

app.post("/signup/", (req, res) => {
    const user = req.body;
    console.log(user);
    db.query("INSERT INTO userInfo VALUES($1, $2)", [user.email, user.pwd], (err) => {
        if (err) {
            res.send("reject");
        } else {
            req.session.user = user.email;
            res.send("accept");
        }
    })
    
})

app.post("/logout/", (req, res) => {
    req.session.user = null;
    res.send("accept");
})

//Always check with this to make sure user is logged in, even before loading the page
app.get("/user/", (req, res) => {
    if (req.session.user != null) {
        res.send(req.session.user);
    } else {
        res.send(null);
    }
})

app.listen(3000, () => {
    console.log("Now listening at port 3000...");
})