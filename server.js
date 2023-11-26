const express = require("express");
const app = express();
const path = require("path")
const bodyParser = require("body-parser")
const http = require("http")
const server = http.Server(app)
const io = require('socket.io')(server)
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
    res.redirect("/networks/0")
});


//Main Network load Function
app.get("/networks/*", (req, res) => {
    const parts = req.url.split('/');

    let id = undefined
    if (parts.length = 3) {
        id = parts[2]
    } else {
        id = 0
    }
    
    let network = Networks.getNetwork(id)
    //console.log(network)

    const data = {}
    data["network"] = network
    
    if (network === "Network Not Found") {
        res.redirect("/networks")
    }

    res.render("networks/networks.jade", { data: encodeURIComponent(JSON.stringify(data, Networks.stringifyNetwork))})
});

app.get("/*", (req, res) => {
    res.redirect("/networks/0")
});

//Start server listening
app.listen(PORT, function (err) {
    if(err){console.log(err)}
    console.log("Server listening on port", PORT)
});