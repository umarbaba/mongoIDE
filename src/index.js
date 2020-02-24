const electron = require('electron');

const tree = require('electron-tree-view')

let sideBarTree = {}

electron.ipcRenderer.on("item:connect", (e, allServerData) => {
    console.log("item in connect page ", allServerData)
    displayTree(allServerData.dbsWithCollections)
    populateServerStatus(allServerData.serverStatus)
})

electron.ipcRenderer.on("item:dbDetails", (e, dbDetails) => {
    populateDbStatus(dbDetails)
})


function displayTree(treeData) {

    let root = {}
    root.name = "Local";
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
        if(node.type==='db'){
            electron.ipcRenderer.send("item:getDbDetails",node.name)
        }
    })

   // electron.ipcRenderer.send("item:getcollectionsOfDBs",dbs)
}


function populateServerStatus(serverStatus) {
    document.querySelector('#activeConnections').innerHTML = serverStatus.connections.active;
    document.querySelector('#dbVersion').innerHTML = serverStatus.version ;
}

function populateDbStatus(dbStats) {

    document.querySelector('#selectedDbName').innerHTML = dbStats.db;
    document.querySelector('#noOFCollection').innerHTML = dbStats.collections;
    document.querySelector('#totalSizeOccupied').innerHTML = Math.ceil(dbStats.fsUsedSize/(1024*1024*1024)) +'gb' ;
    document.querySelector('#noOfDocuments').innerHTML = dbStats.objects ;
}