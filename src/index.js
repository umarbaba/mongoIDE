const electron = require('electron');

const tree = require('electron-tree-view')

let sideBarTree = {}

electron.ipcRenderer.on("item:connect", (e, item) => {
    console.log("item in connect page ", item)
    displayDBs(item)
})

function displayDBs(item) {
    let ul = document.querySelector("ul")
    let dbs = []
    item.forEach(db => {

        li = document.createElement("li")
        li.innerText = db["dbName"]
        dbs.push(db["dbName"])
        ul.appendChild(li)
    });

    let root = {}
    root.name = "Local";
    root.children = [];

    item.forEach(db => {
        let dbName = db.dbName;
        let collectionArray = []
        db.collections.forEach(collection => {
            let collectionName = collection.s.namespace.collection
            collectionArray.push({name:collectionName,children:[]})
        })
        let tempObj = {}
        tempObj.name = db.dbName
        tempObj.children = collectionArray;
        root.children.push(tempObj);
    })
    const tree = require('electron-tree-view')({
        root,
        container: document.querySelector('.sidebar'),
        children: c => c.children,
        label: c => c.name
      })
       

    //electron.ipcRenderer.send("item:getcollectionsOfDBs",dbs)
}

