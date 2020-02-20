const { app, BrowserWindow, Menu,Tray } = require('electron')
const electron =require('electron')
const path = require('path');

var mainWindow
function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true
    }
  })
  mainWindow.loadFile('index.html')
  mainWindow.setThumbarButtons([

    {
      tooltip: 'connect',
      icon:  electron.nativeImage.createFromPath(path.join(__dirname, 'connect.jpg')),
      click() { console.log('button1 clicked') }
    },
    {
      tooltip: 'connect',
      icon:  electron.nativeImage.createFromPath(path.join(__dirname, 'connect2.png')),
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
  mainWindow.maximize()
  
 
  //mainWindow.webContents.openDevTools()
}

function createMenu() {
  const menu = Menu.buildFromTemplate(menuItemsTemplate)
  Menu.setApplicationMenu(menu)
}

function CreateHostAddWindow(){
  const hostWin = new BrowserWindow({
    width: 450,
    height: 400,
    webPreferences: {
      nodeIntegration: true
    }
  })
  hostWin.loadFile('src/addHost.html')
  hostWin.removeMenu();
  hostWin.setTitle("Add Host");

}

function createConnectWindow() {
  const connectWin = new BrowserWindow({
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
      label:"Create",
      click(){
        CreateHostAddWindow()
      }
    },
    {
      label:"Remove"
    }
  ]
  const menu = Menu.buildFromTemplate(connectMenuTemplate)
  connectWin.setMenu(menu)


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