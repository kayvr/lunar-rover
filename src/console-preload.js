const { contextBridge, ipcRenderer  } = require('electron')

contextBridge.exposeInMainWorld('electron', {
  geminiRequest: (url) => ipcRenderer.invoke('mainGeminiRequest', url),
  spartanRequest: (url) => ipcRenderer.invoke('spartanRequest', url),
  systemOpenUrl: (url) => ipcRenderer.invoke('systemOpenUrl', url),
})
