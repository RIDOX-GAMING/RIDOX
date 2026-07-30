/* =========================================================
   RIDOX — Electron Preload Script
   Exposes a minimal, explicit API surface to the renderer via
   contextBridge. No direct Node/IPC access is ever given to
   the page itself (contextIsolation stays enabled).
   ========================================================= */

const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('ridoxAPI', {
  isElectron: true,
  minimize: () => ipcRenderer.send('window:minimize'),
  maximize: () => ipcRenderer.send('window:maximize'),
  close: () => ipcRenderer.send('window:close'),
});
