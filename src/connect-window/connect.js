const electron = require('electron');


/* electron.ipcRenderer.on("item:host",(e,item)=>{
    console.log("item in connect page ",item)
    addHost(item)
}) */
let allConnections = null;

electron.ipcRenderer.on("connect:updateHostList", (e, connectionObjects) => {
    addHosts(connectionObjects);

    allConnections = connectionObjects;
})
electron.ipcRenderer.send("storage:getAllConnections", {})

function addHosts(connectionObjects) {
    let tableBody = document.querySelector("#connectionTableBody");
    tableBody.innerHTML = '';
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
        tdPort.innerHTML = connection.port
        tr.appendChild(tdPort)

        let tdUName = document.createElement("td")
        tdUName.innerHTML = connection.username || ''
        tr.appendChild(tdUName)

        let pwd = document.createElement("td")
        let dummyPwd = '';
        if (connection.password) {
            for (let i = 0; i < connection.password.length; i++) {
                dummyPwd += '*';
            }
        }
        pwd.innerHTML = dummyPwd || ''
        tr.appendChild(pwd)


        let action = document.createElement("td")
        let connectButton = document.createElement('button');
        connectButton.innerHTML = ('connect')
        connectButton.addEventListener('click', () => {
            connectServer(connection)
        })

        let deleteIcon = document.createElement('i');
        deleteIcon.classList.add('material-icons');
        deleteIcon.classList.add('actionIcon');
        deleteIcon.classList.add('actionIconDelete');
        deleteIcon.classList.add('mongoIEDicon');
        deleteIcon.innerHTML = 'delete_sweep';
        deleteIcon.addEventListener('click', () => {
            deleteConnection(connection)
        })



        let editIcon = document.createElement('i');
        editIcon.classList.add('material-icons');
        editIcon.classList.add('actionIcon');
        editIcon.classList.add('actionIconEdit');
        editIcon.classList.add('mongoIEDicon');
        editIcon.innerHTML = 'build';
        editIcon.addEventListener('click', () => {
            editConnection(connection)
        })



        let actionContainerDiv = document.createElement('div');
        actionContainerDiv.classList.add('actionContainerDiv');
        actionContainerDiv.append(connectButton);
        actionContainerDiv.append(editIcon);
        actionContainerDiv.append(deleteIcon);

        action.append(actionContainerDiv);
        tr.appendChild(action)

        tableBody.appendChild(tr)
    });

}


function connectServer(conObj) {
    electron.ipcRenderer.send("item:connect", conObj)
}



function editConnection(connection) {
    document.querySelector('#addNewConnectionBtn').classList.add('hideBtn');
    document.querySelector('#cancelUpdateBtn').classList.remove('hideBtn');

    document.querySelector("#connectionName").value = connection.name || 'New Connection';
    document.querySelector('#updateConnectionBtn').classList.remove('hideBtn');
    document.querySelector("#host").value = connection.host || 'loaclhost';
    document.querySelector("#port").value = connection.port  || 27017
    document.querySelector("#uname").value = connection.username||''  
    document.querySelector("#pwd").value = connection.password  ||'';
    document.querySelector('#updateConnectionBtn').addEventListener('click', ()=>{
        deleteConnection(connection);
        addConnection();
        document.querySelector('#addNewConnectionBtn').classList.remove('hideBtn');
        document.querySelector('#updateConnectionBtn').classList.add('hideBtn');
        document.querySelector('#cancelUpdateBtn').classList.add('hideBtn');
    } )
}


function addConnection() {
    let connectionName = document.querySelector("#connectionName").value || 'New Connection';
    const host = document.querySelector("#host").value || 'loaclhost';
    const port = document.querySelector("#port").value || 27017
    const uname = document.querySelector("#uname").value;
    const pwd = document.querySelector("#pwd").value;


    if (allConnections != null && allConnections.length > 0) {
        let index = 0;
        let orgConName = connectionName;
        while (true) {
            let matched = false;
            for (let connection of allConnections) {
                if (connection.name.trim().toLowerCase() == connectionName.trim().toLowerCase()) {
                    matched = true;
                    break;
                }
            }
            if (matched) {
                index++;
                connectionName = orgConName + ' ' + index;

            } else {
                break;
            }
        }

    }

    const connectionDetails = {
        host: host.trim(),
        port,
        name: connectionName.trim(),
        username: uname,
        password: pwd
    }
    // electron.ipcRenderer.send('item:host',hostDetails)
    electron.ipcRenderer.send('storage:addNewConnection', connectionDetails);
    electron.ipcRenderer.send("storage:getAllConnections", {})
    connectionFormReset();
}

function deleteConnection(connObj) {
    electron.ipcRenderer.send('storage:deleteConnection', connObj);
}
function connectionFormReset(){
    document.querySelector("#connectionName").value = '';
    document.querySelector("#host").value ='';
    document.querySelector("#port").value = '';
    document.querySelector("#uname").value = '';
    document.querySelector("#pwd").value = '';
}
function init() {
    document.querySelector('#addNewConnectionBtn').addEventListener('click', addConnection)
    document.querySelector('#cancelUpdateBtn').addEventListener('click', (event)=>{
        event.target.classList.add('hideBtn');
        document.querySelector('#addNewConnectionBtn').classList.remove('hideBtn');
        document.querySelector('#updateConnectionBtn').classList.add('hideBtn');
        connectionFormReset();
    })

    
}

window.addEventListener('load', _ => {
    init();
})