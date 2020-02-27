const electron = require('electron');

window.addEventListener("load",_=>{
    electron.ipcRenderer.on("item:invalid", (e, message) => {
        appendMessage(message)
     })
})



function appendMessage(message){
    let ele = document.getElementById("message");
    ele.innerHTML = message
    console.log(message);
}