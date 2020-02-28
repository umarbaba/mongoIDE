const electron = require('electron');
let sideBarTree = {}
var editor = null
let currentdb = null

electron.ipcRenderer.on("item:connect", (e, serverDetails) => {
    displayTree(serverDetails.serverData.dbsWithCollections, serverDetails.connectionName)
    populateServerStatus(serverDetails.serverData.serverStatus)
})

electron.ipcRenderer.on("item:dbDetails", (e, dbDetails) => {
    populateDbStatus(dbDetails)
})

electron.ipcRenderer.on("item:collectionData", (e, collectionData) => {
    console.log(collectionData)
    currentdb = collectionData.node.dbName;
    displayEditor(collectionData.node)
    displayTable(collectionData.collectionData)
})

electron.ipcRenderer.on('main:queryResult', (e, result) => {
    console.log(result);
    if (Array.isArray(result.result)) {
        displayTable(result.result)
    }
    else {
        //displayJson.call(this,result.result);
        //displayJson(result.result)
        let result = []
        result.push(result.result)
        displayTable(result.result)
    }
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
            collectionArray.push({ name: collectionName, dbName: db.dbName, host: root.name, type: "collection", children: [] })
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
        else if (node.type === 'collection') {
            electron.ipcRenderer.send("item:getCollectionData", node)

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
        sizeInBytes = (sizeInBytes / tb).toFixed(2) + ' TB'
    }
    else if (sizeInBytes > gb) {
        sizeInBytes = (sizeInBytes / gb).toFixed(2) + ' GB'
    }
    else if (sizeInBytes > mb) {
        sizeInBytes = (sizeInBytes / mb).toFixed(2) + ' MB'
    }
    else if (sizeInBytes > kb) {
        sizeInBytes = (sizeInBytes / kb).toFixed(2) + ' KB'
    }
    else {
        sizeInBytes = Math.ceil(sizeInBytes) + ' Bytes'
    }
    return sizeInBytes;
}


function displayEditor(data) {
    document.querySelector("#hostDetails").style.display = "none"
    const path = require('path');
    const amdLoader = require('../../node_modules/monaco-editor/min/vs/loader.js');
    const amdRequire = amdLoader.require;
    const amdDefine = amdLoader.require.define;

    function uriFromPath(_path) {
        var pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    }

    amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, '../../node_modules/monaco-editor/min'))
    });

    self.module = undefined;

    amdRequire(['vs/editor/editor.main'], function () {
        if (editor == null) {
            editor = monaco.editor.create(document.getElementById('query'), {
                value: "db.collection(\'" + data.name + "\').find({})",
                language: 'javascript',
                lineNumbers: "off",
                roundedSelection: false,
                scrollBeyondLastLine: false,
                readOnly: false,
                theme: "vs-dark",
            });
        }
        else {
            editor.setValue("db.collection('" + data.name + "').find({})")
        }
    });
}

function displayJson(result) {
    let data = document.getElementById("data")
    console.log('here', $)
    data.innerHTML = ""
    $('#data').jsonViewer(result)
}

function displayTable(collectionData) {
    let data = document.getElementById("data")

    data.innerHTML = ""
    let table = document.createElement("table")
    let tr = document.createElement("tr")



    Object.keys(collectionData[0]).forEach(key => {
        let th = document.createElement("th")
        th.innerText = key
        tr.appendChild(th);
    })
    table.appendChild(tr)

    collectionData.forEach(entry => {
        tr = document.createElement("tr")
        Object.keys(entry).forEach(function (key) {
            let td = document.createElement("td")
            if (key == '_id') {
                let innerText = entry[key].id.toString().split(',').map(num=> {return parseInt(num).toString(16)}).reduce((x,y)=>{return x+y})
                td.innerText = "ObjectId(\""+innerText+"\")";
            }
            else {
                td.innerText = (entry[key])

            }
            tr.appendChild(td)
        });
        table.appendChild(tr)
    })
    data.appendChild(table)
}

function runQuery() {
    let query = editor.getValue();

    if (query.startsWith("db.")) {
        electron.ipcRenderer.send("item:query", { currentdb, query })
    }
    else {
        let message = "Query should start with 'db' object \n e.g db.collection('collectionName').find({})"
        electron.ipcRenderer.send("error:invalid", message);
    }
}