//Handles Networks Database - constant pre-generated Networks for now

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
    const network = new Network(id, "Linux Directories Large", "Jenna Mathison", [3,3])
    network.addDescription("Network Map containing Linux Directories - This map contains 3 directory within the root directory")

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
    const network = new Network(id, "Linux Directories Small", "Jenna Mathison", [2,2])
    network.addDescription("Network Map containing Linux Directories - This map contains only 1 directory within the root directory")

    const rNode = new Node(0, "Root", network,[1,1], "Directory")
    const hNode = new Node(1, "Home", network,[2,2], "Directory")
    const rel = new Edge(0, "Contains", network, rNode, hNode)

    return network
}

//Babel Network
function genBabel(id) {
    const network = new Network(id, "Babel", "Ali Bolcakan", [8, 7])
    network.addDescription("This is a copy of Mapping Tower of Babel translators and translations by merrill, links to Hathi Trust catalog material by bolcakan.")

    //Root and Bottom of Network
    const penta = new Node(0, "Pentateuch", network, [1,2], "Book")
    const septua  = new Node(1, "Septuagint", network, [1,4], "Book")

    const bible = new Node(2, "King James Bible", network, [4,5], "Book")
    const william = new Node(3, "William Tyndale", network, [2,6], "Person")
    const tyndalesOld = new Node(4, "Tyndale's Old Testament", network, [3,6], "Book")

    const translation = new Node(5, "Translation", network, [1,7], "Book")

    const pts = new Edge(0, "Translated To", network, penta, septua)
    const ptt = new Edge(1, "Translated To", network, penta, tyndalesOld)

    const stt = new Edge(2, "Translated To", network, septua, tyndalesOld)
    const stb = new Edge(3, "Translated To", network, septua, bible)

    const wtt = new Edge(4, "Author", network, william, tyndalesOld)


    //Middle of Network
    const jerome = new Node(6, "Jerome", network, [2,1], "Person")
    const vulgate = new Node(7, "Vulgate", network, [3,2], "Book")
    const dieGantze = new Node(8, "Die gantze Heilige Schrifft", network, [3,3], "Book")
    const mLuther = new Node(9, "Martin Luther", network, [4,3], "Person")

    const ptj = new Edge(5, "Author", network, penta, jerome)

    const drBible = new Node(10, "Douay-Reims Bible", network, [5,4], "Book")


    //Right  of Network
    const schrift = new Node(11, "Die Schrift", network, [6,4], "Book")
    const mBuber = new Node(12, "Martin Buber", network, [7,3], "Person")
    const franz = new Node(13, "Franz Rozenzwieg", network, [8,4], "Person")



    const moses = new Node(14, "The Five Books of Moses", network, [7,1], "Book")
    const everett = new Node(15, "Everett Fox", network, [8,1], "Person")



    return network
}
    

//Returns network object based on networkName
module.exports = {
    getNetwork: function(networkID) {
        for (let i = 0; i < Networks.length; i++) {
            const network = Networks[i]
            if (network.id == networkID) {
                return network.generate(network.id)
            }
        }
        return "Network Not Found"
    }
}
