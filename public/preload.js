const { contextBridge, ipcRenderer } = require('electron');

console.log('Preload script loading...');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  selectFolder: () => ipcRenderer.invoke('select-folder'),
  initializePARA: (basePath) => ipcRenderer.invoke('initialize-para', basePath),
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  listDirectory: (dirPath) => ipcRenderer.invoke('list-directory', dirPath),
  
  // File system watcher events
  onFileAdded: (callback) => ipcRenderer.on('file-added', callback),
  onFileChanged: (callback) => ipcRenderer.on('file-changed', callback),
  onFileRemoved: (callback) => ipcRenderer.on('file-removed', callback),
  onFolderAdded: (callback) => ipcRenderer.on('folder-added', callback),
  onFolderRemoved: (callback) => ipcRenderer.on('folder-removed', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});

console.log('Preload script loaded successfully!');
