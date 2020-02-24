const electron = require('electron');

electron.ipcRenderer.on("item:connect",(e,item)=>{
    console.log("item in connect page ",item)
    displayDBs(item)
})

function displayDBs(item){
    let ul = document.querySelector("ul")
    let dbs = []
    item.forEach(db => {

        li = document.createElement("li")
        li.innerText= db["dbName"]
        dbs.push( db["dbName"])
        ul.appendChild(li)
    });

    //electron.ipcRenderer.send("item:getcollectionsOfDBs",dbs)
}