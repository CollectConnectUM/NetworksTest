//Jenna Mathison

import { SVG } from "https://cdn.skypack.dev/@svgdotjs/svg.js@3.2.0";

//Defining Network Classes
class Network {
    constructor(name, size)  {
        this.name = name;
        this.grid = new Grid(size,this);

        this.root = undefined;
        this.nodes = [];
        this.edges = [];

    }

    addNode(node) {
        if (this.nodes.length == 0) {
            this.root = node;
        }
        this.nodes.push(node);
        node.network = this;

        if (node.position != undefined) {
            this.grid.insert(node,[node.position[0],node.position[1]]);
        } else {
            this.grid.insert(node);
        }

        return node;
    }

    addEdge(edge) {
        this.edges.push(edge);
        edge.network = this;
        return edge;
    }
}

class Node {
    constructor(name, network, position = undefined)  {
        this.name = name;
        this.network = network;
        this.position = position;

        this.edges = [];
        this.icon = undefined;

        network.addNode(this);
    }

    addRelationship(edge) {
        this.edges.push(edge);
    }
}

class Edge {
    constructor(type, network, obj1, obj2)  {
        this.type = type;
        this.network = network;
        this.obj1 = obj1;
        this.obj2 = obj2;

        obj1.addRelationship(this);
        obj2.addRelationship(this);

        network.addEdge(this);
    }
}

class Grid {
    constructor(size, network) {
        this.size = size;
        this.network = network;

        this.grid = [];
        for (let y = 0; y <= size[0]; y++) {
            this.grid.push([]);
        }
        for(let y = 1; y <= size[0]; y++) {
            for (let x = 1; x <= size[1]; x++) {
                this.grid[y][x] = undefined;
            }
        }
    }

    insert(node, pos = [this.network.nodes.length+1,this.network.nodes.length+1]) {
        if (node.position != undefined) {
            this.grid[node.position[0]][node.position[1]] = node;
        } else {
            this.grid[pos[0]][pos[1]] = node;
        }
        return true;
    } 
}

class View {
    constructor(viewType) {
        this.viewType = viewType;
    }
    
    selectViewType(viewType) {
        if (this.viewType != viewType) {
            this.viewType = viewType
        }
    }
}


//Functions
let generateNetwork = function() {
    let network = new Network("Test Network",[2,2]);

    let rNode = network.addNode(new Node("Root",network,[1,1]))
    let hNode =network.addNode(new Node("Home",network,[2,2]))
    let rel = network.addEdge(new Edge("Within",network,rNode,hNode))

    return network;
}

let initSVG = function(size = {x:"100%", y:"100%"}) {
    //let divSize = {x:document.getElementById("SVGDiv").style.width, y:document.getElementById("SVGDiv").style.height}
    let draw = SVG().addTo("#SVGDiv").size(size.x,size.y);
    draw.rect("100%","100%").fill("color: light-grey;")
    
    return draw;
}

const initView = function() {
    let view = new View();
    view.selectViewType("Map");
    return view;
}

//Main Program
const network = generateNetwork();

console.log(network);

let viewMode = 0;
let svg = initSVG();
let view = initView();

