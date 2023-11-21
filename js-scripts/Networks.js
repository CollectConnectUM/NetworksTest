//Networks Database(temp obviously)
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
export default Networks = {
    getNetwork: function(networkName) {
        if (Networks[networkName] != undefined) {
            const network = Networks[networkName]()
            return network
        } else {
            return "ERROR: Network Not Found"
        }
    }
}