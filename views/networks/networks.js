//Jenna Mathison

//import SVG from "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.0/svg.min.js";
//SVG.js is currently imported through html for client side usage

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
            const node = new Node(curNode.id, curNode.name, network, curNode.position, curNode.type, curNode.author, curNode.description)
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
    constructor(id, name, network, position, type = "Object", author="None", description = "None")  {
        this.id = id
        this.name = name
        this.network = network
        this.position = position
        this.type = type
        this.author = author

        this.edges = []
        this.image = undefined

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
    SVG: undefined,
    Grid: [],
    Objects: [],
    Relationships: [],

    //draw grid on svg
    init: function(network, size, SVGDiv) {
         this.SVG = SVG().addTo(SVGDiv).size(size.x,size.y).viewbox(0,0,SVGDiv.clientWidth,SVGDiv.clientHeight).attr({id: "SVGDraw"})
    },

    drawGrid: function(network, svg, cellSize) {
        const networkGrid = network.grid
        let nmString = "Network Map"
        let gridGroup = svg.group().addClass("Grid").attr({id: "network-map", tabindex: "0", role: "grid", "aria-label": nmString})
        for (let y = 0; y < networkGrid.size[1]; y++) {
            const gridRow = []
            let gridRowGroup = gridGroup.group().addClass("gridRow").attr({role: "row"})
            for (let x = 0; x < networkGrid.size[0]; x++) {
                let cell = gridRowGroup.group().addClass("cell").attr({role: "gridcell"})
                cell.rect(cellSize.x,cellSize.y).fill("white").stroke({color: "black", width: "2"}).move(cellSize.x * x, cellSize.y * y + 2).addClass("gridCell")
                gridRow.push(cell)
            }
            Draw.Grid.push(gridRow)
        }
    },


    //draw object methods
    drawObject: function(group,cellSize,node) {
        const object = group.group().addClass("object").attr({id: "object"+ node.id})

        //object image
        let image = undefined;
        if (node.image == undefined) {
            image = object.circle(24).fill("skyblue").move((cellSize.x * node.position[0] - (cellSize.x / 2)) - 10, (cellSize.y * node.position[1] - (cellSize.y / 2)) - 20)
        } else { //Need to test with an image still
            image = object.image(node.image)
            image.move((cellSize.x * node.position[0] - (cellSize.x / 2)) - (image.width() / 2), (cellSize.y * node.position[1] - (cellSize.y / 2)) - (image.height() / 2))
        }
        image.addClass("objectImage").attr({})

        //object text
        let objText = object.text((add) => {
            let nameSpan = add.tspan(node.name)
            nameSpan.dx(0).dy(0).addClass("objectTextName")

            let posSpan = add.tspan("X" + node.position[0].toString() + " Y" + node.position[1].toString()).newLine()
            posSpan.dx(0).dy("1em").addClass("objectTextPos")
        })
        objText.move(image.x() + (image.width() / 2) , image.y() + image.height()).attr({"text-anchor": "middle" })

        //Add to Draw Objects List
        Draw.Objects.push(object)
    },

    drawObjects: function(network, svg, cellSize) {
        const objGroup = svg.group().addClass("Objects")
        for (let i = 0; i < network.nodes.length; i++) {
            const node = network.nodes[i]
            Draw.drawObject(objGroup, cellSize, node)
        }
    },


    //draw relationship methods
    drawRelationship: function(group, cellSize, edge) {
        const rel = group.group().addClass("relationship").attr({id: "rel" + edge.id})
    
        const linePos = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }
        
        if (edge.obj1.image == undefined) {
            linePos.x1 = Number(cellSize.x * edge.obj1.position[0]) - (cellSize.x / 2)
            linePos.y1 = Number(cellSize.y * edge.obj1.position[1]) - (cellSize.y / 2) - 10
        } else {
            //code for if image is there
        }
        if (edge.obj2.image == undefined) {
            linePos.x2 = Number(cellSize.x * edge.obj2.position[0]) - (cellSize.x / 2) 
            linePos.y2 = Number(cellSize.y * edge.obj2.position[1]) - (cellSize.y / 2) - 10
        } else {
            //code for if image is there
        }
        
        let relLine = rel.line(linePos.x1, linePos.y1, linePos.x2 , linePos.y2).stroke({width: 2, color: "black"}).addClass("relLine")
        
        //draw relationship text
        let relText = rel.text((add) => {
            add.tspan(edge.type).addClass("relText").attr({"aria-hidden": "true"})
        })
        relText.attr({"text-anchor": "middle"})
        
        //determie line rotation
        const rotation = {
            w: linePos.x2 - linePos.x1,
            h: linePos.y2 - linePos.y1,
            rotate: 0
        }
        rotation.rotate = (Math.atan(rotation.w/rotation.h) * 180 / Math.PI)
        rotation.rotate = rotation.rotate > 0 ? 90 - rotation.rotate : -90 - rotation.rotate 
        console.log(rotation.rotate)

        const amove = {x: 25, y: 25}
        if (Math.abs(rotation.rotate) < 1) {
            amove.x = 0
            amove.y = -10
        } else if (Math.abs(Math.abs(rotation.rotate) - 90) < 1) {
            amove.x = -10
            amove.y = 0
        }
        console.log(amove)

        relText.amove(relLine.cx() + amove.x, relLine.cy() + amove.y)
        relText.rotate(rotation.rotate)

        /*let rotation = undefined
        if ((linePos.x1 / linePos.x2) > 0.9 && (linePos.x1 / linePos.x2) < 1.1 ) {
            rotation = 90
        } else if ((linePos.y1 / linePos.y2) > 0.9 && (linePos.y1 / linePos.y2) < 1.1 ) {
            rotation = 0
        } else if ((linePos.x1 < linePos.x2) && (linePos.y1 < linePos.y2)){
            rotation = 45
        } else if ((linePos.x1 > linePos.x2) && (linePos.y1 < linePos.y2)){
            rotation = - 45
        }

        //set text pos/rotation
        if (rotation == 90) {
            relText.move(linePos.x1 + (relLine.attr("stroke-width") * 2), linePos.y1 + (relLine.height() / 2))
            relText.transform({rotate: 0})
        } else if (rotation == 0) {
            relText.move(linePos.x1 + relLine.width() / 5, linePos.y1)
            relText.transform({rotate: 0})
        } else if (rotation == 45) {
            relText.move(linePos.x1 + relLine.width() / 3, linePos.y1 + relLine.height() / 3)
            relText.transform({rotate: rotation})
        } else if (rotation == -45) {
            relText.move(linePos.x2, linePos.y1 + relLine.height() / 3)
            relText.transform({rotate: rotation})
        }*/

        Draw.Relationships.push(rel)
    },

    drawRelationships: function(network, svg, cellSize) {
        const relGroup = svg.group().addClass("Relationships")
        for (let i = 0; i < network.edges.length; i++) {
            const edge = network.edges[i]
            Draw.drawRelationship(relGroup, cellSize, edge)
        }
    }
}


//Client Functions
const initSVG = function(network, size = {x:"100%", y:"100%"}) {
    //Setup svg element
    const SVGDiv = document.getElementById("SVGDiv")
    Draw.init(network, size, SVGDiv)

    //Draw grid
    const cellSize = {x: 150, y: 100}
    Draw.drawGrid(network, Draw.SVG, cellSize)

    //Setup Initial Viewbox based on Network Size
    const svgSize = {x: 0, y: 0, w: 0, h: 0}

    svgSize.x = 0
    svgSize.y = (-1) * cellSize.y
    svgSize.w = (Draw.Grid[0].length * cellSize.x)
    svgSize.h = ((Draw.Grid.length + 2) * cellSize.y) + (Draw.Grid.length * 2)

    Draw.SVG.viewbox(svgSize.x.toString() + " " + svgSize.y.toString() + " " + svgSize.w.toString() + " " + svgSize.h.toString())
    
    //Draw relationships
    Draw.drawRelationships(network, Draw.SVG, cellSize)
    //Draw objects
    Draw.drawObjects(network, Draw.SVG, cellSize)
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

    //vbmove function
    function vbMove() {
        svg.viewbox(camera.x.toString() + " " + camera.y.toString() + " " + camera.w.toString() + " " + camera.h.toString())
    }

    //mouse events for controlling viewbox translation
    const move = {x: 0, y: 0, startX: 0, startY: 0}
    svg.mousedown((m) => {
        if (m.buttons >= 1) {
            camera.down = true
            move.x = m.clientX
            move.y = m.clientY
            move.startX = m.clientX
            move.startY = m.clientY
        }
    })

    svg.mousemove((m) => {
        if (camera.down === true) {
            if ((svgDiv.clientWidth) > (m.clientX - move.startX) && (svgDiv.clientHeight) > (m.clientY - move.startY)) {
                
                let difX = move.x - m.clientX
                if (m.clientX > move.x) {
                    camera.x = camera.x + difX
                    camera.w = camera.w + difX / 2
                } else {
                    camera.x = camera.x + difX
                    camera.w = camera.w + difX / 2
                }

                let difY = move.y - m.clientY
                if (m.clientY > move.y) {
                    camera.y = camera.y + difY
                    camera.h = camera.h + difY / 2
                } else {
                    camera.y = camera.y + difY
                    camera.h = camera.h + difY / 2
                }

                camera.w = camera.w > 0 ? camera.w : 1
                camera.h = camera.h > 0 ? camera.h : 1

                vbMove()

                move.x = m.clientX
                move.y = m.clientY
            } else {
                camera.down = false
            }
        }
    })

    svg.mouseup((m) => {
        if (camera.down === true) {
            camera.down = false

            let difX = move.x - m.clientX
            if (m.clientX > move.x) {
                camera.x = camera.x + difX
                camera.w = camera.w + difX / 2
            } else {
                camera.x = camera.x + difX
                camera.w = camera.w + difX / 2
            }

            let difY = move.y - m.clientY
            if (m.clientY > move.y) {
                camera.y = camera.y + difY
                camera.h = camera.h + difY / 2
            } else {
                camera.y = camera.y + difY
                camera.h = camera.h + difY / 2
            }

            camera.w = camera.w > 0 ? camera.w : 1
            camera.h = camera.h > 0 ? camera.h : 1

            vbMove()
        }
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
            vbMove()
        }
    }

    svgElement.oncontextmenu = (m) => m.preventDefault()

    return true
}

//Info Panel intitialization function
const initInfoPanel = function(network) {
    const nameElement = document.getElementById("property-name")
    const authorElement = document.getElementById("owner")
    const descDiv = document.getElementById("Description")
    const descElement = descDiv.getElementsByClassName("propertyInfo")[0]

    nameElement.innerHTML = network.name
    authorElement.innerHTML = network.author
    descElement.innerHTML = network.description

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

//View Controller and Init Function
const ViewController = {
    view: "",
    changeView: function(newView) {
        this.view = newView
    }
}

function initViewController(newView = "Map") {
    ViewController.changeView(newView)

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

//Main Program
function main() {
    data = JSON.parse(decodeURIComponent(data));
    console.log("Data:", data.network)

    const network = Network.toNetwork(data.network)
    console.log("Network:", network)

    initSVG(network)
    initCamera()
    initInfoPanel(network)
    initGridButton()
    initViewController()
} main();