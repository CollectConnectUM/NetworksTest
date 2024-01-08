//Jenna Mathison

//SVG.js imported through client side html for drawing Network Map
//Docs: https://svgjs.dev/docs/3.1/

//Start Network Classes
class Network {
    constructor(id, name, author, size, description = "None")  {
        this.id = id
        this.name = name
        this.author = author
        this.grid = new Grid(size,this)

        this.root = undefined
        this.nodes = []
        this.edges = []

        this.description = description

        return this
    }

    addNode(node) {
        if (this.nodes.length == 0) {
            this.root = node
        }
        this.nodes.push(node)
        node.network = this

        if (node.position != undefined) {
            this.grid.insert(node,[node.position[0],node.position[1]])
        } else {
            this.grid.insert(node)
        }

        return this
    }

    addEdge(edge) {
        this.edges.push(edge)
        edge.network = this
        return this
    }

    addDescription(desc) {
        this.description = desc
        return this
    }

    toJSON(key) {
        if (key === "network") {
            this.grid = this.grid.size
            this.root = undefined
            for (let i = 0; i < this.nodes.length; i++) {
                this.nodes[i].network = undefined
                this.nodes[i].edges = []
            }
            for (let i = 0; i < this.edges.length; i++) {
                this.edges[i].network = undefined
                this.edges[i].obj1 = this.edges[i].obj1.id
                this.edges[i].obj2 = this.edges[i].obj2.id
            }
        }
        return this
    }

    static toNetwork(networkObject) {
        const obj = networkObject
        const network = new Network(obj.id, obj.name, obj.author, obj.grid, obj.description)

        const nodes = []
        for (let i = 0; i < obj.nodes.length; i++) {
            const curNode = obj.nodes[i]
            const node = new Node(curNode.id, curNode.name, network, curNode.position, curNode.type, curNode.author, curNode.description, curNode.image)
            nodes.push(node)
        }

        const edges = []
        for (let i = 0; i < obj.edges.length; i++) {
            const curEdge = obj.edges[i]
            let obj1 = nodes.find((node) => node.id == curEdge.obj1)
            let obj2 = nodes.find((node) => node.id == curEdge.obj2)
            const edge = new Edge(curEdge.id, curEdge.type, network, obj1, obj2)
            edges.push(edge)
        }
        return network
    }
}

class Node {
    constructor(id, name, network, position, type = "Object", author="None", description = "None", image = undefined)  {
        this.id = id
        this.name = name
        this.network = network
        this.position = position
        this.type = type
        this.author = author

        this.edges = []
        this.image = image

        this.description = description

        network.addNode(this)
        return this
    }

    addRelationship(edge) {
        this.edges.push(edge)
        return this
    }

    addDescription(desc) {
        this.description = desc
        return this
    }

    addImage(image) {
        this.image = image
        return this
    }
}

class Edge {
    constructor(id, type, network, obj1, obj2)  {
        this.id = id
        this.type = type
        this.network = network
        this.obj1 = obj1
        this.obj2 = obj2

        obj1.addRelationship(this)
        obj2.addRelationship(this)

        network.addEdge(this)
        return this
    }
}

class Grid {
    constructor(size, network) {
        this.size = size
        this.network = network

        this.grid = []
        for (let y = 0; y <= size[0]; y++) {
            this.grid.push([])
        }
        for(let y = 1; y <= size[0]; y++) {
            for (let x = 1; x <= size[1]; x++) {
                this.grid[y][x] = undefined
            }
        }
        return this
    }

    insert(node, pos = [this.network.nodes.length+1,this.network.nodes.length+1]) {
        if (node.position != undefined) {
            this.grid[node.position[0]][node.position[1]] = node
        } else {
            this.grid[pos[0]][pos[1]] = node
        }
        return this
    }
}
//End Network Classes


//Draw Object and Functions
const Draw = {
    CellSize: {x: 180, y: 180}, //default cell size

    SVG: undefined,
    Grid: undefined,
    Objects: undefined,
    Relationships: undefined,

    //draw grid on svg
    init: function(SVGDiv) {
        Draw.SVG = SVG().addTo(SVGDiv).size("100%","100%").viewbox(0,0,SVGDiv.clientWidth,SVGDiv.clientHeight).attr({id: "SVGDraw"})
        Draw.Grid = Draw.SVG.group().addClass("Grid").attr({id: "network-map", tabindex: "0", role: "grid", "aria-label": "Network Map", "visibility": "visible"})
        Draw.Relationships = Draw.SVG.group().addClass("Relationships")
        Draw.Objects = Draw.SVG.group().addClass("Objects")

        return this
    },

    drawGrid: function(network, cellSize = Draw.CellSize) {
        const networkGrid = network.grid
        for (let y = 0; y < networkGrid.size[1]; y++) {
            let gridRow = Draw.Grid.group().addClass("gridRow").attr({role: "row"})
            for (let x = 0; x < networkGrid.size[0]; x++) {
                let cell = gridRow.group().addClass("cell").attr({role: "gridcell"})
                cell.rect(cellSize.x,cellSize.y).fill("white").stroke({color: "black", width: "2"}).move(cellSize.x * x, cellSize.y * y + 2).addClass("gridCell")
            }
        }
        return this
    },


    //draw object methods
    drawObject: function(node, cellSize = Draw.CellSize, group = Draw.Objects) {
        const object = group.group().addClass("object").attr({id: "object"+ node.id})

        let image = undefined;
        let objText = undefined

        //object image
        if (node.image === undefined | node.image == "" ) {
            image = object.circle(24).fill("skyblue").move((cellSize.x * node.position[0] - (cellSize.x / 2)) - 10, (cellSize.y * node.position[1] - (cellSize.y / 2)) - 20)
        } else {

            image = object.image(node.image, (event) => {
                let nw = event.target.naturalWidth
                let nh = event.target.naturalHeight
                const offset = {x: (cellSize.x - nw) / 2, y: (cellSize.y - nh) / 2 - 10}

                image.move(image.x() + offset.x, image.y() + offset.y)
                objText.move(objText.x() + event.target.naturalWidth / 2 + offset.x, objText.y() + event.target.naturalHeight + offset.y)
            })
            image.move((cellSize.x * (node.position[0] -1)), (cellSize.y * (node.position[1]-1)))

        }
        image.addClass("objectImage").attr({})

        //object text
        objText = object.text((add) => {
            let nameSpan = add.tspan(node.name)
            nameSpan.dx(0).dy(0).addClass("objectTextName")

            let posSpan = add.tspan("X" + node.position[0].toString() + " Y" + node.position[1].toString()).newLine()
            posSpan.dx(0).dy("1em").addClass("objectTextPos")
        })
        objText.move(image.cx(), image.cy() + image.height() / 2).attr({"text-anchor": "middle" })

        return this
    },

    drawObjects: function(network) {
        for (let i = 0; i < network.nodes.length; i++) {
            const node = network.nodes[i]
            Draw.drawObject(node)
        }
        return this
    },


    //draw relationship methods
    drawRelationship: function(edge, cellSize = Draw.CellSize, group = Draw.Relationships) {
        const rel = group.group().addClass("relationship").attr({id: "rel" + edge.id})

        const linePos = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }

        let obj1Image = edge.obj1.image
        if (obj1Image == undefined | obj1Image == "") {
            linePos.x1 = Number(cellSize.x * edge.obj1.position[0]) - (cellSize.x / 2)
            linePos.y1 = Number(cellSize.y * edge.obj1.position[1]) - (cellSize.y / 2) - 10
        } else {
            let obj1Image = Draw.Objects.find("#object"+edge.obj1.id)[0].first()
            linePos.x1 = obj1Image.x() + Draw.CellSize.x / 2
            linePos.y1 = obj1Image.y() + Draw.CellSize.y / 2 - 10
        }

        let obj2Image = edge.obj2.image
        if (obj2Image == undefined | obj2Image == "") {
            linePos.x2 = Number(cellSize.x * edge.obj2.position[0]) - (cellSize.x / 2)
            linePos.y2 = Number(cellSize.y * edge.obj2.position[1]) - (cellSize.y / 2) - 10
        } else {
            let obj2Image = Draw.Objects.find("#object"+edge.obj2.id)[0].first()
            linePos.x2 = obj2Image.x() + Draw.CellSize.x / 2
            linePos.y2 = obj2Image.y() + Draw.CellSize.y / 2 - 10
        }

        let relLine = rel.line(linePos.x1, linePos.y1, linePos.x2 , linePos.y2).stroke({width: 2, color: "black"}).addClass("relLine")

        //draw relationship text
        let relText = rel.text((add) => {
            add.tspan(edge.type).addClass("relText").attr({"aria-hidden": "true"})
        })
        relText.attr({"text-anchor": "middle"})

        //Determie line rotation
        const rotation = {
            w: linePos.x2 - linePos.x1,
            h: linePos.y2 - linePos.y1,
            rotate: 0
        }
        rotation.rotate = (Math.atan(rotation.w/rotation.h) * 180 / Math.PI)
        rotation.rotate = rotation.rotate > 0 ? 90 - rotation.rotate : -90 - rotation.rotate

        //Determine line movement
        const amove = {x: 25, y: 25}
        let absRotate = Math.abs(rotation.rotate)
        if (absRotate < 7.5) {
            amove.x = 0
            amove.y = -10
        } else if (absRotate >= 7.5 && absRotate < 22.5 ){
            amove.x = 5
            amove.y = -10
        } else if (absRotate >= 22.5 && absRotate < 37.5 ){
            amove.x = 10
            amove.y = -15
        } else if (absRotate >= 37.5 && absRotate < 52.5 ){
            amove.x = 10
            amove.y = -10
        } else if (absRotate >= 52.5 && absRotate < 67.5 ){
            amove.x = 15
            amove.y = -10
        } else if (absRotate >= 67.5 && absRotate < 82.5 ){
            amove.x = 15
            amove.y = -5
        } else if (absRotate >= 82.5) {
            amove.x = 15
            amove.y = 20
        }
        if (rotation.rotate < 0) {
            amove.x = amove.x * -1
            amove.y = amove.y
        }

        relText.amove(relLine.cx() + amove.x, relLine.cy() + amove.y)
        relText.rotate(rotation.rotate)
        return this
    },

    drawRelationships: function(network) {
        for (let i = 0; i < network.edges.length; i++) {
            const edge = network.edges[i]
            Draw.drawRelationship(edge)
        }
        return this
    }
}


//Client Functions

//SVG Initialization Function
const initSVG = function(network) {
    //Setup svg element and draw grid
    const SVGDiv = document.getElementById("SVGDiv")
    Draw.init(SVGDiv).drawGrid(network)

    //Setup Initial Viewbox based on Network Size
    const svgSize = {x: 0, y: 0, w: 0, h: 0}
    const cellSize = Draw.CellSize
    const gridChildren = Draw.Grid.children()

    svgSize.x = 0
    svgSize.y = (-1) * cellSize.y
    svgSize.w = (gridChildren[0].children().length * cellSize.x)
    svgSize.h = ((gridChildren.length + 2) * cellSize.y)

    Draw.SVG.viewbox(svgSize.x.toString() + " " + svgSize.y.toString() + " " + svgSize.w.toString() + " " + svgSize.h.toString())

    //Draw relationships and objects
    Draw.drawObjects(network).drawRelationships(network)
}

//Starts the Camera Controller for svg
const initCamera = function() {
    const svg = Draw.SVG
    const svgElement = document.getElementById("SVGDraw")
    //setup camera object
    let camera = {down: false, x: 0, y: 0, w: 0, h: 0, scale: {value: 0, factor: 25}}

    const svgDiv = document.getElementById("SVGDiv")
    const vb = svg.viewbox()
    camera.x = vb.x
    camera.y = vb.y
    camera.w = vb.w
    camera.h = vb.h

    function vbUpdate() {
        svg.viewbox(camera.x.toString() + " " + camera.y.toString() + " " + camera.w.toString() + " " + camera.h.toString())
    }

    //mouse events for controlling viewbox translation
    const move = {moving: false, leaveTimer: null,}

    //mouse events
    svg.on(["mousedown"], (e) => {
        if (e.buttons >= 1) {
            camera.down = true
        }
    })

    svg.on(["mousemove"], (e) => {
        if(move.leaveTimer != null) {
            clearTimeout(move.leaveTimer)
            move.leaveTimer = null
        }
        if (camera.down === true) {
            const difX = e.movementX
            camera.x = camera.x - difX

            const difY = e.movementY
            camera.y = camera.y - difY

            vbUpdate()
        }
    })

    svg.on(["mouseleave"],(e) => {
        move.leaveTimer = setTimeout(() => {
            if (move.leaveTimer != null) {
                camera.down = false
            }
        }, 1000)
    })

    // touch events
    const touchMove = {touchList: [], action: null, actionTimer: null, topTouch: -1}

    svg.on(["touchstart"], (e) => {
        e.preventDefault()
        if (touchMove.action === null) {
            touchMove.touchList.push(e.changedTouches.item(0))

            if (touchMove.actionTimer === null) {
                touchMove.actionTimer = setTimeout(() => {
                    if (touchMove.actionTimer != null) {
                        if(touchMove.touchList.length == 1) {
                            touchMove.action = "translate"
                        } else if (touchMove.touchList.length == 2) {
                            touchMove.action = "zoom"
                            for (let touch in touchMove.touchList) {
                                if (touchMove.topTouch == -1) {
                                    touchMove.topTouch = touchMove.touchList[touch].identifier
                                } else {
                                    if(touchMove.touchList[touchMove.topTouch].clientY < touchMove.touchList[touch].clientY)
                                        touchMove.topTouch = touchMove.touchList[touch].identifier
                                }
                            }
                        }
                        console.log(touchMove.action)
                    }
                }, 15)
            } 
        } 
    })

    svg.on(["touchmove"], (e) => {
        e.preventDefault()
        if(touchMove.action == "translate") {
            const newTouch = e.changedTouches.item(0)
            const oldTouch = touchMove.touchList.findIndex((val) => val.identifier === newTouch.identifier)
            if(oldTouch != -1) {
                const difX = touchMove.touchList[oldTouch].clientX - newTouch.clientX
                camera.x = camera.x + difX

                const difY = touchMove.touchList[oldTouch].clientY - newTouch.clientY
                camera.y = camera.y + difY

                vbUpdate()

                touchMove.touchList[oldTouch] = newTouch
            }
            
        } else if(touchMove.action == "zoom") {
            const newTouchList = []
            for (let i = 0; i < e.changedTouches.length; i++) 
                newTouchList.push(e.changedTouches.item(i))

            let difY = 0
            for (let newTouch of newTouchList) {
                const oldTouch = touchMove.touchList.findIndex((val, i) => val.identifier == newTouch.identifier ? true : false)

                if(newTouch.identifier == touchMove.topTouch) {
                    difY += (touchMove.touchList[oldTouch].clientY - newTouch.clientY)
                } else {
                    difY -= (touchMove.touchList[oldTouch].clientY - newTouch.clientY)
                }

                touchMove.touchList[oldTouch] = newTouch
            }

            let newCam = {down: camera.down, x: 0, y: 0, w: 0, h: 0, scale: {value: camera.scale.value, factor: camera.scale.factor}}
            newCam.x = camera.x - difY
            newCam.y = camera.y - difY
            newCam.w = camera.w + difY * 2
            newCam.h = camera.h + difY * 2

            newCam.w = newCam.w > 0 ? newCam.w : 1
            newCam.h = newCam.h > 0 ? newCam.h : 1

            if (newCam.w > 0 && newCam.h > 0) {
                camera = newCam
                vbUpdate()
            }
        }
    })

    svg.on(["touchend"], (e) => {
        e.preventDefault()
        
        const endTouch = e.changedTouches.item(0)
        const inTL = touchMove.touchList.findIndex((val,i) => val.identifier == endTouch.identifier ? true : false)
        if (inTL != -1) {
            touchMove.touchList.splice(inTL, 1)
            if (touchMove.touchList.length == 0) {
                touchMove.action = null
                clearTimeout(touchMove.actionTimer)
                touchMove.actionTimer = null
                touchMove.topTouch = -1
            }
        }
    })

    svg.on(["mouseup", "touchcancel"],(e) => {
        camera.down = false
    })

    function roundToNearest(numToRound, numToRoundTo) {
        numToRoundTo = 1 / (numToRoundTo);

        return Math.round(numToRound * numToRoundTo) / numToRoundTo;
    }

    //mouse scrolling to zoom viewbox in/out
    svgElement.onwheel = (m) => {
        m.preventDefault()

        const scaleFactor = camera.scale.factor
        let scale = Math.round(m.deltaY)

        if (Math.abs(scale) >= (scaleFactor / 2)) {
            scale = roundToNearest(scale, scaleFactor)
        } else if (Math.abs(scale) >= (scaleFactor / 4)) {
            scale = scale > 0 ? (scaleFactor / 2) : (-1) * (scaleFactor / 2)
        } else if (Math.abs(scale) >= (scaleFactor / 8)) {
            scale = scale > 0 ? (scaleFactor / 4) : (-1) * (scaleFactor / 4)
        } else {
            scale = scale * scaleFactor / 10
        }

        let numFactor = scale / scaleFactor

        camera.scale.value = camera.scale.value + numFactor

        let newCam = {down: camera.down, x: 0, y: 0, w: 0, h: 0, scale: {value: camera.scale.value, factor: camera.scale.factor}}
        newCam.x = camera.x - scale
        newCam.y = camera.y - scale
        newCam.w = camera.w + scale * 2
        newCam.h = camera.h + scale * 2

        newCam.w = newCam.w > 0 ? newCam.w : 1
        newCam.h = newCam.h > 0 ? newCam.h : 1

        if (newCam.w > 0 && newCam.h > 0) {
            camera = newCam
            vbUpdate()
        }
    }

    svgElement.oncontextmenu = (m) => m.preventDefault()

    return true
}

//Toggle visible of the SVG Grid when the grid button is pressed
const initGridButton = function() {
    const gb = document.getElementById("grid-button")
    const svgGrid = document.getElementById("network-map")

    let visible = true
    gb.onclick = (m) => {
        if (m.button == 0) {
            if (visible) {
                svgGrid.setAttribute("visibility", "hidden")
                visible = false
            } else {
                svgGrid.setAttribute("visibility", "visible")
                visible = true
            }
        }
    }

    return true
}



//change infoPanel contents
const changeInfoPanel = function(item) {
    //Change Collapse Text
    const collapseName = document.getElementById("collapseName")
    collapseName.innerHTML = item.name

    //Change Name/Owner Text
    const nameElement = document.getElementById("property-name")
    const authorElement = document.getElementById("owner")
    nameElement.innerHTML = item.name
    authorElement.innerHTML = item.author

    //Change Description Text
    const descDiv = document.getElementById("Description")
    const descElement = descDiv.getElementsByClassName("propertyInfo")[0]
    descElement.innerHTML = item.description
}

//Info Panel init text elements and collpase function
const initInfoPanel = function(network) {
    ViewController.setActive(network)

    //Init Collapse Behavior
    const cButton = $("#collapseButton")
    let collapsed = false
    cButton.on("click",(m) => {
        const infoList = $("#infoList")
        const collapseName = $("#collapseName")
        const cIcon = $("#collapseIcon")
        if (!collapsed) {
            collapsed = true
            infoList.addClass("ILCollapse")
            collapseName.removeClass("nameCollapse")
            cIcon.attr("src","/static/img/arrow-left.svg");
        } else {
            collapsed = false
            infoList.removeClass("ILCollapse")
            collapseName.addClass("nameCollapse")
            cIcon.attr("src","/static/img/arrow.svg");
        }
    })

    //

    return true
}

//View Controller and Init Function
const ViewController = {
    view: "",
    network: null,
    activeItem: null,
    changeView: function(newView) {
        this.view = newView
    },
    setActive: function(item) {
        this.activeItem = item
        changeInfoPanel(item)
    },
    resetVC: function() {
        this.setActive(network)
    }
}

function initViewController(newView = "Map", network) {
    ViewController.changeView(newView)
    ViewController.network = network

    const mapButton = $("#map-button")
    const editButton = $("#edit-button")

    if (newView == "Map") {
        mapButton.addClass("VBSelected")
    } else if(newView == "Edit") {
        editButton.addClass("VBSelected")
    }

    mapButton.click((m) => {
        ViewController.changeView("Map")
        mapButton.addClass("VBSelected")
        editButton.removeClass("VBSelected")
    })

    editButton.click((m) => {
        ViewController.changeView("Edit")
        editButton.addClass("VBSelected")
        mapButton.removeClass("VBSelected")
    })
}

//Grid visibility for keyboard shortcut -Jaishree
function toggleGridVisibility() {
    const svgGrid = document.getElementById("network-map");
    const isVisible = svgGrid.getAttribute("visibility") === "visible";
    svgGrid.setAttribute("visibility", isVisible ? "hidden" : "visible");
}

//Switching to edit tab for keyboard shortcut -Jaishree
function switchToEditTab() {
    ViewController.changeView("Edit");

    $("#map-button").removeClass("VBSelected");
    $("#edit-button").addClass("VBSelected");
}

//Switching to map tab for keyboard shortcut -Jaishree
function switchToMapTab() {
    ViewController.changeView("Map");

    $("#edit-button").removeClass("VBSelected");
    $("#map-button").addClass("VBSelected");
}

//Open Info Page for keyboard shortcut -Jaishree
let infoPageOpen = false;
function toggleInfoPage() {
    if (infoPageOpen) {
        closeModal();
    } else {
        openModal();
    }
}

// Function to open the info page
function openModal() {
    console.log("called open modal")
    window.doOpenModal();
    infoPageOpen = true;
}

// Function to close the info page
function closeModal() {
    window.doCloseModal();
    infoPageOpen = false;
}


//Keyboard Shortcuts Function - moved for readability in main
function initShortcuts() {
    document.addEventListener("keydown", function (event) {
        if (event.key.toLowerCase() === "g") {
            toggleGridVisibility();
        }
        if (event.key.toLowerCase() === "e") {
            switchToEditTab();
        }
        if (event.key.toLowerCase() === "m") {
            switchToMapTab();
        }
        if (event.key.toLowerCase() === "i") {
            toggleInfoPage();
        }

    })
}

// Render info modal and prepare function to be called for onclick
window.doOpenModal = function() {};
window.doCloseModal = function() {};
function renderModal(network) {
    function renderNodes() {
        if (network.nodes.length > 0) {
            let html = "", n = network.nodes.length;
            for(let i = 0; i < n; i++) {
                let node = network.nodes[i];
                html += "<li>" + node.name + "</li>";
            }
            $("#nodesList").html(html);
        }
        else {
            $("#nodesList").html("<li><p>No node for this network.</p></li>")
        }
    }

    function renderEdges() {
        if (network.edges.length > 0) {
            let html = "", n = network.edges.length;
            for(let i = 0; i < n; i++) {
                let edge = network.edges[i];
                html += "<li>" + edge.obj1.name + " " + edge.type.toLowerCase() + " " + edge.obj2.name + "</li>";
            }
            $("#edgesList").html(html);
        }
        else {
            $("#edgesList").html("<li><p>No edge for this network.</p></li>")
        }
    }

    // Initialize info modal
    let modal = $("#modal").dialog({
        resizable: true,
        height: window.innerHeight * 0.7,
        width: window.innerWidth * 0.9,
        modal: true,
        autoOpen: false,
        open: function() {
            if (network.name) $("#nameVal").text(network.name);
            else $("#nameVal").text("No name for this network.");
            
            if (network.description) $("#descVal").text(network.description);
            else $("#descVal").text("No description for this network.");

            if (network.author) $("#authorVal").text(network.author);
            else $("#authorVal").text("No author for this network.");

            renderNodes();
            renderEdges();
        },
        close: function() {

        }
    });

    // Initialize open modal function
    function openModal() {
        modal.dialog("open");
    }
    window.doOpenModal = openModal;

    // Initialize close modal function
    function closeModal() {
        modal.dialog("close");
    }
    window.doCloseModal = closeModal;

    // Do resize if needed
    let queuedTimeout = null;
    function doResize() {
        modal.dialog('option', 'height', window.innerHeight * 0.7);
        modal.dialog('option', 'width', window.innerWidth * 0.9);
        queuedTimeout = null;
    }
    window.onresize = function() {
        if ( queuedTimeout ) clearTimeout(queuedTimeout);
        queuedTimeout = setTimeout(doResize, 150);
    };
}


//Main Program
function main() {
    data = JSON.parse(decodeURIComponent(data));
    console.log("Data:", data.network)

    const network = Network.toNetwork(data.network)
    console.log("Network:", network)

    //Initialize Functions for Network page
    renderModal(network)
    initSVG(network)
    initCamera()
    initViewController()
    initInfoPanel(network)
    initGridButton()
    initShortcuts()
}main();
