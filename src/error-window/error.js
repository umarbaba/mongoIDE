const electron = require('electron');

window.addEventListener("load", _ => {
    electron.ipcRenderer.on("item:invalid", (e, message) => {
        appendMessage(message)
    })
})



function appendMessage(message) {
    let heading = document.getElementById("messageHeading");
    let span = document.createElement("span")
    span.innerHTML = "<i class=\"material-icons\">error</i>"
    heading.appendChild(span)
    let h3 = document.createElement("h3")
    h3.innerHTML = "An error has occured";
    heading.appendChild(h3)

    let body = document.getElementById("messagebody");

    let ele = document.createElement("div");

    ele.innerHTML = message
    body.appendChild(ele)
    console.log(message);
}