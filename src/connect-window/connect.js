const electron = require('electron');


/* electron.ipcRenderer.on("item:host",(e,item)=>{
    console.log("item in connect page ",item)
    addHost(item)
}) */


electron.ipcRenderer.on("connect:updateHostList", (e, connectionObjects) => {
    addHosts(connectionObjects)
})
electron.ipcRenderer.send("storage:getAllConnections",{})

function addHosts(connectionObjects) {
    let tableBody = document.querySelector("#connectionTableBody");
    tableBody.innerHTML='';
    // addTableHeader(table) 

    connectionObjects.forEach(connection => {

        let tr = document.createElement("tr")
        tdName = document.createElement("td")
        tdName.innerHTML = connection.name
        tr.appendChild(tdName)

        let tdHost = document.createElement("td")
        tdHost.innerHTML = connection.host
        tr.appendChild(tdHost)

        let tdPort = document.createElement("td")
        tdPort.innerHTML = connection.port|| 27017
        tr.appendChild(tdPort)

        let tdUName = document.createElement("td")
        tdUName.innerHTML = connection.username||''
        tr.appendChild(tdUName)

        let pwd = document.createElement("td")
        pwd.innerHTML = connection.password||''
        tr.appendChild(pwd)

        let action = document.createElement("td")
        let button= document.createElement('button');
        button.innerHTML=('connect')
        button.addEventListener('click',()=>{
            connectServer(connection)
        })
        action.append(button);
        tr.appendChild(action)

        tableBody.appendChild(tr)
    });

}



function connectServer(conObj) {
    electron.ipcRenderer.send("item:connect", conObj)
}