const electron = require('electron');

const tree = require('electron-tree-view')

let sideBarTree = {}

electron.ipcRenderer.on("item:connect", (e, serverDetails) => {
    displayTree(serverDetails.serverData.dbsWithCollections, serverDetails.connectionName)
    populateServerStatus(serverDetails.serverData.serverStatus)
})

electron.ipcRenderer.on("item:dbDetails", (e, dbDetails) => {
    populateDbStatus(dbDetails)
})


function displayTree(treeData, connectionName) {

    let root = {}
    root.name = connectionName;
    root.children = [];

    treeData.forEach(db => {
        let dbName = db.dbName;
        let collectionArray = []
        db.collections.forEach(collection => {
            let collectionName = collection.s.namespace.collection
            collectionArray.push({ name: collectionName, children: [] })
        })
        let tempObj = {}
        tempObj.name = db.dbName
        tempObj.children = collectionArray;
        tempObj.type = 'db';
        root.children.push(tempObj);
    })
    const tree = require('electron-tree-view')({
        root,
        container: document.querySelector('.sidebar'),
        children: c => c.children,
        label: c => c.name
    })

    tree.on('selected', node => {
        if (node.type === 'db') {
            electron.ipcRenderer.send("item:getDbDetails", node.name)
        }
    })

    // electron.ipcRenderer.send("item:getcollectionsOfDBs",dbs)
}


function populateServerStatus(serverStatus) {
    document.querySelector('#activeConnections').innerHTML = serverStatus.connections.current;
    document.querySelector('#dbVersion').innerHTML = serverStatus.version;
}

function populateDbStatus(dbStats) {

    document.querySelector('#selectedDbName').innerHTML = dbStats.db;
    document.querySelector('#noOFCollection').innerHTML = dbStats.collections;
    document.querySelector('#totalSizeOccupied').innerHTML = toHumanReadableSize(dbStats.objects * dbStats.avgObjSize)
    document.querySelector('#noOfDocuments').innerHTML = dbStats.objects;
    document.querySelector('#avgDocSize').innerHTML = toHumanReadableSize((dbStats.avgObjSize));
}

function toHumanReadableSize(sizeInBytes) {
    let kb = 1024;
    let mb = kb * 1024;
    let gb = mb * 1024;
    let tb = gb * 1024;
    if (sizeInBytes > tb) {
        sizeInBytes = (sizeInBytes/tb).toFixed(2)+' TB'
    }
    else if (sizeInBytes > gb) {
        sizeInBytes = (sizeInBytes/gb).toFixed(2)+' GB'
    }
    else if (sizeInBytes > mb) {
        sizeInBytes = (sizeInBytes/mb).toFixed(2)+' MB'
    }
    else if (sizeInBytes > kb) {
        sizeInBytes = (sizeInBytes/kb).toFixed(2)+' KB'
    }
    else{
        sizeInBytes = Math.ceil(sizeInBytes)+ ' Bytes'
    }
    return sizeInBytes;
}