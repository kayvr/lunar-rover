const {app, BrowserWindow, ipcMain, dialog, shell} = require('electron')
const path = require("path");
const doGeminiRequest = require("./gemini")
const doSpartanRequest = require("./spartan")

const gotSingleInstanceLock = app.requestSingleInstanceLock()

app.commandLine.appendSwitch('enable-unsafe-webgpu')

function createWindow() {
  const mainWindow = new BrowserWindow({
    width:1120, height:900,
    webPreferences: { preload: path.join(app.getAppPath(), 'console-preload.js') }
  })

  mainWindow.loadFile('index.html')
}

function systemOpenUrl(event, url) {
  // There are security concerns when opening untrusted input.
  //
  // See:
  // https://benjamin-altpeter.de/shell-openexternal-dangers/#defending-against-these-attacks
  // https://blog.doyensec.com/2021/02/16/electron-apis-misuse.html
  //
  // We only allow https and http URLs to be opened.
  if (!['https:', 'http:'].includes(new URL(url).protocol)) {
    console.log("Refusing to open the following URL:");
    console.log(url);
    return;
  }

  shell.openExternal(url);
}

app.whenReady().then(() => {
  if (!gotSingleInstanceLock) {
    const options = {
      type: 'info',
      buttons: [],
      title: 'Lunar Rover',
      message: 'Only one instance of lunar rover is supported.',
    };

    dialog.showMessageBoxSync(null, options);
    app.quit();
    return;
  }

  ipcMain.handle('mainGeminiRequest', doGeminiRequest);
  ipcMain.handle('spartanRequest', doSpartanRequest);
  ipcMain.handle('systemOpenUrl', systemOpenUrl);
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  }) 
})

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})
