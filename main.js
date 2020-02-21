const { app, BrowserWindow, Menu, ipcMain } = require('electron')
const electron = require('electron')
const path = require('path');
const dbBridge = require('./dbBridge')

let mainWindow;
let hostWin;
let connectWin;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadFile('src/index.html')
  mainWindow.setThumbarButtons([

    {
      tooltip: 'connect',
      icon: path.join(__dirname, 'connect2.png'),
      click() { console.log('button1 clicked') }
    }
  ])
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
  hostWin.loadFile('src/addHost.html')
  hostWin.removeMenu();
  hostWin.setTitle("Add Host");
  // hostWin.webContents.openDevTools();

}

function createConnectWindow() {
  connectWin = new BrowserWindow({
    width: 700,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  connectWin.loadFile('src/connect.html')
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
 // connectWin.webContents.openDevTools();

}


ipcMain.on('item:host', (e, item) => {
  console.log(item)
  connectWin.webContents.send('item:host', item)
  hostWin.close();
})

ipcMain.on('item:connect', (e, item) => {
  console.log(".............connecting...............");
  dbBridge.getAllDataBases().then(dbs => {

    console.log("Got the result")
    mainWindow.webContents.send('item:connect', dbs)
    connectWin.close();

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