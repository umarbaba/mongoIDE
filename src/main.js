const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const electron = require('electron')
const path = require('path');
const dbBridge = require('./dbBridge')
const businessLogic = require('./businessLogic')
const storage = require('./storage');

let mainWindow;
let hostWin;
let connectWin;
let errorWin;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadFile('src/dashboard/index.html')
  /*   mainWindow.setThumbarButtons([
      {
        tooltip: 'connect',
        icon: path.join(__dirname, 'connect2.png'),
        click() { console.log('button1 clicked') }
      }
    ]) */
  mainWindow.on('closed', () => {
    app.quit()
  })
  mainWindow.once('ready-to-show', () => {
    mainWindow.show()
    mainWindow.focus()
  })
 // mainWindow.webContents.openDevTools()
}
app.whenReady().then(() => {
  createWindow()
  createMenu()
})
app.on('window-all-closed', () => {

  if (process.platform !== 'darwin') {
    app.quit()
  }
})
app.on('activate', () => {

  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

function createMenu() {
  const menu = Menu.buildFromTemplate(menuItemsTemplate)
  Menu.setApplicationMenu(menu)
}

function CreateHostAddWindow() {
  hostWin = new BrowserWindow({
    width: 450,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  hostWin.loadFile('src/add-new-host-window/addHost.html')
  hostWin.removeMenu();
  hostWin.setTitle("Add Host");
  //hostWin.webContents.openDevTools();

}

function createErrorWindow() {
  return new Promise((resolve, reject) => {
    errorWin = new BrowserWindow({
      width: 400,
      height: 200,
      webPreferences: {
        nodeIntegration: true
      }
    })
    errorWin.loadFile('src/error-window/error.html')
    errorWin.setTitle("Error");
    errorWin.removeMenu();
    resolve()
  })
}
function createConnectWindow() {
  connectWin = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  connectWin.loadFile('src/connect-window/connect.html')
  connectWin.setTitle("Connect");
  const connectMenuTemplate = [
    {
      label: "Create",
      click() {
        CreateHostAddWindow()
      }
    },
    {
      label: "Remove"
    }
  ]
  const menu = Menu.buildFromTemplate(connectMenuTemplate)
  connectWin.setMenu(menu)
  //  connectWin.webContents.openDevTools();
  //connectWin.webContents.openDevTools();

}


ipcMain.on('item:host', (e, item) => {
  console.log(item)
  connectWin.webContents.send('item:host', item)
  hostWin.close();
})


ipcMain.on('item:connect', (event, connectDetails) => {
  dbBridge.setConnectDetails(connectDetails)
  businessLogic.getInitData().then(serverData => {
    mainWindow.webContents.send('item:connect', { serverData, connectionName: connectDetails.name })
  })
  connectWin.close();


})

ipcMain.on('item:getDbDetails', (e, dbName) => {
  businessLogic.getDbDetails(dbName).then(details => {
    mainWindow.webContents.send('item:dbDetails', details)
  })
})

ipcMain.on('item:getCollectionData', (e, node) => {
  businessLogic.getCollectionData(node).then(collectionData => {
    mainWindow.webContents.send('item:collectionData', { collectionData, node })
  })
})


ipcMain.on('storage:addNewConnection', (e, conObj) => {
  storage.addNewConnection(conObj).then(_ => {
    storage.getAllConnections().then(conObjects => {
      connectWin.webContents.send('connect:updateHostList', conObjects)
    })
  });
})

ipcMain.on('item:query', (e, query) => {
  businessLogic.executeQuery(query).then(result => {
    mainWindow.webContents.send('main:queryResult', result)
  })
})


ipcMain.on('error:invalid', (e, message) => {
  createErrorWindow().then(()=>{
    errorWin.webContents.openDevTools();
    setTimeout(_=>{
      errorWin.webContents.send("item:invalid", message)
    },1000)
   
  })
})


ipcMain.on('storage:getAllConnections', (e, conObj) => {
  storage.getAllConnections().then(conObjects => {
    connectWin.webContents.send('connect:updateHostList', conObjects)
  })
})

ipcMain.on('storage:deleteConnection', (e, conObj) => {
  storage.deleteConnection(conObj).then(_ => {
    storage.getAllConnections().then(conObjects => {
      connectWin.webContents.send('connect:updateHostList', conObjects)
    })
  })
})



menuItemsTemplate = [
  {
    label: "File",
    submenu: [
      {
        label: 'Connect',
        click() {
          createConnectWindow()
        }
      },
      {
        label: 'Quit',
        accelerator: process.platform == 'darwin' ? 'command+Q' : 'ctrl+Q',
        click() {
          app.quit();
        }
      }
    ]
  }
]