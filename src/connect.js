const electron = require('electron');

electron.ipcRenderer.on("item:host",(e,item)=>{
    console.log("item in connect page ",item)
    addHost(item)
})
function addHost(item){
    let table = document.querySelector("table")
    addTableHeader(table)
    let tr = document.createElement("tr")
    tdName =document.createElement("td")
    tdName.innerText= item["name"]
    tr.appendChild(tdName)

    tdHost =document.createElement("td")
    tdHost.innerText= item["host"]
    tr.appendChild(tdHost)

    tdPort =document.createElement("td")
    tdPort.innerText= item["port"]
    tr.appendChild(tdPort)

    table.appendChild(tr)
}
function addTableHeader(table){
    console.log(table.innerHTML)
    if(table.innerHTML.trim().length<=0){
        table.innerHTML = "<th>Name</th><th>Host</th><th>Port</th>"
    }
}


function connectServer(){
    
    const hostDetails = {
        host:"host"
    }
    electron.ipcRenderer.send("item:connect",hostDetails)
}