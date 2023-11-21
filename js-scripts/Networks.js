//Handles Networks Database - constant pre-generated Networks for now

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



//Networks Database
const Networks = {
    LinuxSmall: genLinuxSmall,
    LinuxLarge: genLinuxLarge,
    Babel: genBabel
}

//Linux Directories Small Network
function genLinuxLarge(){
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

//Linux Directories Small Network
function genLinuxSmall() {
    let network = new Network(0, "Linux Directories Small", "Developer", [2,2])

    let rNode = new Node(0, "Root", network,[1,1], "Directory")
    let hNode = new Node(1, "Home", network,[2,2], "Directory")
    let rel = new Edge(0, "Contains", network, rNode, hNode)

    return network
}

//Babel Network
function genBabel() {
    return undefined
}
    

//Returns network object based on networkName
module.exports = {
    getNetwork: function(networkName) {
        if (Networks[networkName] != undefined) {
            const network = Networks[networkName]()
            return network
        } else {
            return "ERROR: Network Not Found"
        }
    }
}
