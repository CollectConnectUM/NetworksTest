//Jenna Mathison

//onst { SVG } = require("@svgdotjs/svg.js");
//import SVG from "https://cdnjs.cloudflare.com/ajax/libs/svg.js/3.2.0/svg.min.js";
//SVG.js is currently imported through html for client side usage

//Defining Network Classes
class Network {
    constructor(id, name, author, size, view = VIEWTYPE.Map)  {
        this.id = id
        this.name = name
        this.author = author
        this.grid = new Grid(size,this)
        this.view = view //Default view for the network map

        this.root = undefined
        this.nodes = []
        this.edges = []

        this.description = "Network Description"

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
}

class Node {
    constructor(id, name, network, position = undefined, type = "Object")  {
        this.id = id
        this.name = name
        this.network = network
        this.position = position
        this.type = type

        this.edges = []
        this.image = undefined

        this.description = "Node Description"

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

//network view types
const VIEWTYPE = {
    Map : "map",
    Explore : "explore",
    Edit : "edit"
};

//object for getting color and text variables and a list for updating them via the toolbar
const VARS = {
    cs : getComputedStyle(document.documentElement),
    colorElements : [],
    sizeElements : []
};


//Functions
//draw grid on svg
const drawGrid = function(network, draw, cellSize = {x: 100, y: 100}) {
    const gridTable = []
    const networkGrid = network.grid
    let gridGroup = draw.group().addClass("Grid").attr({id: "network-map", tabindex: "0", role: "grid", "aria-label": "Network Map", "aria-multiselectable": true})
    for (let y = 0; y < networkGrid.size[1]; y++) {
        const gridRow = []
        let gridRowGroup = gridGroup.group().addClass("gridRow").attr({role: "row"})
        for (let x = 0; x < networkGrid.size[0]; x++) {
            let cell = gridRowGroup.group().addClass("cell").attr({})
            cell.rect(cellSize.x,cellSize.y).fill(VARS.cs.getPropertyValue("--bg-main")).stroke({color: VARS.cs.getPropertyValue("--primary"), width: "2"}).move(cellSize.x * x, cellSize.y * y + 2)
            gridRow.push(cell)
        }
        gridTable.push(gridRow)
    }

    //setup elements as colors to manage for accessibility
    VARS.colorElements.push({color: "--bg-main", class: "cell", property: "color"})
    VARS.colorElements.push({color: "--primary", class: "cell", property: "stroke"})

    return gridTable
}

const drawObjects = function(network, draw, cellSize) {
    let drawnObjects = []
    let objGroup = draw.group().addClass("Objects")
    for (let i = 0; i < network.nodes.length; i++) {
        let node = network.nodes[i]
        let object = objGroup.group().addClass("object").attr({id: node.name + "Group"})

        let image = undefined;
        if (node.image == undefined) {
            image = object.circle(24).fill("azure").move((cellSize.x * node.position[0] - (cellSize.x / 2)) - 10, (cellSize.y * node.position[1] - (cellSize.y / 2)) - 20)
        } else { //Need to test with an image still
            image = object.image(node.image)
            image.move((cellSize.x * node.position[0] - (cellSize.x / 2)) - (image.width() / 2), (cellSize.y * node.position[1] - (cellSize.y / 2)) - (image.height() / 2))
        }
        image.attr({name: node.name, id: node.name})

        let objText = object.text((add) => {
            let nameSpan = add.tspan(node.name).dx(0).dy(0).addClass("objectTextName")
            add.tspan("X" + node.position[0].toString() + " Y" + node.position[1].toString()).dx(-1 * (nameSpan.length() / 1.2)).dy("1em").addClass("objectTextPos")
        })
        objText.move(image.x() - (objText.length() / 6), image.y() + image.height())

        //addtextScaling/object scaling here

        drawnObjects.push(object)
    }
    return drawnObjects
}

const drawRelationships = function(network, draw, cellSize) {
    const drawnRelationships = []
    let relGroup = draw.group().addClass("Relationships")
    for (let i = 0; i < network.edges.length; i++) {
        let edge = network.edges[i]
        let rel = relGroup.group().addClass("relationship")

        let linePos = {
            x1: 0,
            y1: 0,
            x2: 0,
            y2: 0
        }

        //let object1 = document.getElementById(edge.obj1.name)
        //let object2 = document.getElementById(edge.obj2.name)
        
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
        
        let relLine = rel.line(linePos.x1, linePos.y1, linePos.x2 , linePos.y2).stroke({width: 4, color: "black"})

        
        //determie line rotation
        let rotation = undefined
        if ((linePos.x1 / linePos.x2) > 0.9 && (linePos.x1 / linePos.x2) < 1.1 ) {
            rotation = 90
        } else if ((linePos.y1 / linePos.y2) > 0.9 && (linePos.y1 / linePos.y2) < 1.1 ) {
            rotation = 0
        } else if ((linePos.x1 < linePos.x2) && (linePos.y1 < linePos.y2)){
            rotation = 45
        } else if ((linePos.x1 > linePos.x2) && (linePos.y1 < linePos.y2)){
            rotation = - 45
        }

        //draw relationship text
        let relText = rel.text((add) => {
            add.tspan(edge.type).addClass("relText")
        })

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
        }

        drawnRelationships.push(rel)

        //WIP make lines go under objects
        /*let use1 = document.createElement("use")
        use1.setAttribute("href", "#" + edge.obj1.name + "Group")
        use1.setAttribute("x", object1.getAttribute("cx"))
        use1.setAttribute("y", object1.getAttribute("cy"))


        let use2 = document.createElement("use")
        use2.setAttribute("href", "#" + edge.obj2.name + "Group")
        use2.setAttribute("x", object2.getAttribute("cx"))
        use2.setAttribute("y", object2.getAttribute("cy"))

        document.getElementById("SVGDraw").appendChild(use1)
        document.getElementById("SVGDraw").appendChild(use2)*/
    }
    return drawnRelationships
}

const initSVG = function(network, size = {x:"100%", y:"100%"}) {
    //setup svg element
    let SVGDiv = document.getElementById("SVGDiv")
    let draw = SVG().addTo(SVGDiv).size(size.x,size.y).viewbox(0,0,SVGDiv.clientWidth,SVGDiv.clientHeight).attr({id: "SVGDraw"})

    //draw grid
    const cellSize = {x: 120, y: 120}
    const gridTable = drawGrid(network, draw, cellSize)

    //setup viewbox
    const viewSize = {x: 0, y: 0, offset: 20}
    viewSize.x = gridTable.length * cellSize.x + (viewSize.offset * 2)
    viewSize.y = gridTable[0].length * cellSize.y + (viewSize.offset * 2)
    draw.viewbox((-1 *viewSize.offset).toString() + " " + (-1 *viewSize.offset).toString() + " " + viewSize.x.toString() + " " + viewSize.y.toString())
    
    //draw relationships
    const Relationships = drawRelationships(network,draw, cellSize)

    //draw objects
    const Objects = drawObjects(network, draw, cellSize)

    return draw;
}

//Starts the Camera Controller for svg
const initCamera = function(svg) {
    //setup camera object
    let camera = {down: false, x: 0, y: 0, w: 0, h: 0}

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
        camera.down = true
        move.x = m.clientX
        move.y = m.clientY
        move.startX = m.clientX
        move.startY = m.clientY
    })

    svg.mousemove((m) => {
        if (camera.down === true) {
            if ((svgDiv.clientWidth) > (m.clientX - move.startX) && (svgDiv.clientHeight) > (m.clientY - move.startY)) {
                let difX = move.x - m.clientX
                let difY = move.y - m.clientY

                camera.x = camera.x + difX
                camera.y = camera.y + difY
                camera.w = camera.w + difX
                camera.h = camera.h + difY

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
            let difY = move.y - m.clientY

            camera.x = camera.x + difX
            camera.y = camera.y + difY
            camera.w = camera.w + difX
            camera.h = camera.h + difY

            vbMove()
        }
    })

    //mouse scrolling to zoom viewbox in/out 
    let svgElement = document.getElementById("SVGDraw")
    svgElement.onwheel = (m) => {
        m.preventDefault()

        let scale = m.deltaY / 10
        
        let newCam = {down: camera.down, x: 0, y: 0, w: 0, h: 0}
        newCam.x = camera.x - scale
        newCam.y = camera.y - scale
        newCam.w = camera.w + scale * 2
        newCam.h = camera.h + scale * 2 

        if (newCam.w > 0 && newCam.h > 0) {
            camera = newCam
            vbMove()
        }
    }

    return true
}

//Info Panel intitialization function
const initInfoPanel = function(network) {
    const nameElement = document.getElementById("property-name")
    const authorElement = document.getElementById("owner")
    const descDiv = document.getElementById("Description")
    const descElement = descDiv.getElementsByClassName("propertyDescription")

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
        if (visible) {
            svgGrid.setAttribute("visibility", "hidden")
            visible = false
        } else {
            svgGrid.setAttribute("visibility", "visible")
            visible = true
        }
    }

    return true
}

//Main Program
//Test Network Generation Functions - Editable

//2x2 network with root contains home
/*let generateNetwork = function() {
    let network = new Network(0, "Linux Directories Small", "Developer", [2,2])

    let rNode = new Node(0, "Root", network,[1,1], "Directory")
    let hNode = new Node(1, "Home", network,[2,2], "Directory")
    let rel = new Edge(0, "Contains", network, rNode, hNode)

    return network
}*/

//3x3 network with root contains home, usr, and boot
let generateNetwork = function() {
    let network = new Network(0, "Linux Directories Large", "Developer", [3,3])

    let rNode = new Node(0, "Root", network,[2,1], "Directory") //Root

    let hNode = new Node(1, "Home", network,[1,2], "Directory") //Home
    let hrel = new Edge(0, "Contains", network, rNode, hNode)

    let uNode = new Node(2, "Usr", network,[2,3], "Directory") //Usr
    let urel = new Edge(1, "Contains", network, rNode, uNode)

    let bNode = new Node(3, "Boot", network,[3,2], "Directory") //Boot
    let brel = new Edge(2, "Contains", network, rNode, bNode)

    return network
}

function main() {
    const network = generateNetwork()
    console.log(network)

    const svg = initSVG(network)

    initCamera(svg)
    initInfoPanel(network)
    initGridButton()
}
main();


