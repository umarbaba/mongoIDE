const electron = require('electron');

function saveHost(){
    const host =document.querySelector("#host").value;
    const port =document.querySelector("#port").value;
    const name =document.querySelector("#name").value;
    console.log(host +" : "+ port+"--------------"+name)
    const hostDetails = {
        host:host,
        port:port,
        name:name
    }
   // electron.ipcRenderer.send('item:host',hostDetails)
    electron.ipcRenderer.send('storage:addNewConnection',hostDetails)
}
