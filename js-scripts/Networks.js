//Handles Networks Database - constant pre-generated Networks for now

//Start Network Classes
class Network {
    constructor(id, name, author, size)  {
        this.id = id
        this.name = name
        this.author = author
        this.grid = new Grid(size,this)
        

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
        const network = new Network(obj.id, obj.name, obj.author, obj.grid)

        const nodes = []
        for (let i = 0; i < obj.nodes.length; i++) {
            const curNode = obj.nodes[i]
            const node = new Node(curNode.id, curNode.name, network, curNode.position, curNode.type, curNode.author)
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
    constructor(id, name, network, position, type = "Object", author="Unknown")  {
        this.id = id
        this.name = name
        this.network = network
        this.position = position
        this.type = type
        this.author = author

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
//End Network Classes



//Networks Database
const Networks = [
    {
        id: 0,
        generate: genLinuxSmall
    },
    {
        id: 1,
        generate: genLinuxLarge
    },
    {
        id: 2,
        generate: genBabel

    }
]

//Linux Directories Small Network
function genLinuxLarge(id){
    const network = new Network(id, "Linux Directories Large", "Developer", [3,3])

    const rNode = new Node(0, "Root", network,[2,1], "Directory") //Root

    const hNode = new Node(1, "Home", network,[1,2], "Directory") //Home
    const hrel = new Edge(0, "Contains", network, rNode, hNode)

    const uNode = new Node(2, "Usr", network,[2,3], "Directory") //Usr
    const urel = new Edge(1, "Contains", network, rNode, uNode)

    const bNode = new Node(3, "Boot", network,[3,2], "Directory") //Boot
    const brel = new Edge(2, "Contains", network, rNode, bNode)

    return network
}

//Linux Directories Small Network
function genLinuxSmall(id) {
    const network = new Network(0, "Linux Directories Small", "Developer", [2,2])

    const rNode = new Node(0, "Root", network,[1,1], "Directory")
    const hNode = new Node(1, "Home", network,[2,2], "Directory")
    const rel = new Edge(0, "Contains", network, rNode, hNode)

    return network
}

//Babel Network
function genBabel(id) {
    const network = new Network(id, "Babel", "Ali Bolcakan", [12, 7])
    network.addDescription("This is a copy of Mapping Tower of Babel translators and translations by merrill, links to Hathi Trust catalog material by bolcakan.")

    const bible = new Node(0, "King James Bible", network, [1,1], "Book")
    const penta = new Node(1, "Pentateuch", network, [5,4], "Book")

    const bibleToPenta = new Edge(0, "Translated From", network, bible, penta)

    return network
}
    

//Returns network object based on networkName
module.exports = {
    getNetwork: function(networkID) {
        for (let i = 0; i < Networks.length; i++) {
            const network = Networks[i]
            if (network.id == networkID) {
                return network.generate()
            }
        }
        return "Network Not Found"
    }
}
