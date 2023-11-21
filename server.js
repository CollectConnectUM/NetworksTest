const express = require("express");
const app = express();
const path = require("path")
const bodyParser = require("body-parser")
const PORT = 9000;

//import Networks Database
const Networks = require("./js-scripts/Networks.js")

//Setup view engine
app.set("view engine", "jade");
app.set("views", path.join(__dirname, "views"));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use("/views", express.static(path.join(__dirname, 'views')))
app.use("/static", express.static(path.join(__dirname, 'static')));

//Setup routing
app.get('/', (req, res) => {
    res.redirect("/networks")
});

app.get("/networks", (req, res) => {
    const defaultNetworkID = 0
    res.redirect("/networks/" + defaultNetworkID.toString())
});


//Main Network load Function
app.get("/networks/*", (req, res) => {
    const data = {}
    const parts = req.url.split('/');

    if (parts.length = 3) {
        data["id"] = parts[2]
    } else {
        data["id"] = 0
    }

    res.render("networks/networks.jade", { data: encodeURIComponent(JSON.stringify(data)) })
});

app.get("/*", (req, res) => {
    res.redirect("/networks")
});

//Start server listening
const server = app.listen(PORT, function (err) {
    if(err){console.log(err)}
    console.log("Server listening on port", PORT)
});

server.on("connection", (socket) => {
    console.log(socket.address)
});