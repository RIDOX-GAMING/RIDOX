/* =========================================================
   RIDOX — Electron Main Process
   - Frameless, centered, modern desktop window
   - Menu bar disabled
   - Secure defaults: contextIsolation on, nodeIntegration off
   ========================================================= */

const { app, BrowserWindow, Menu, ipcMain, shell } = require('electron');
const path = require('path');

// Keep a global reference of the window object to avoid GC closing it.
let mainWindow = null;

const isDev = !app.isPackaged;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 820,
    minWidth: 980,
    minHeight: 640,
    center: true,
    show: false,
    backgroundColor: '#07090d',
    frame: false, // custom titlebar is rendered in the renderer (css/style.css .titlebar)
    titleBarStyle: 'hidden',
    icon: path.join(__dirname, 'assets', 'favicon.png'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      spellcheck: false,
      devTools: isDev,
    },
  });

  // Fully disable the native application menu bar.
  Menu.setApplicationMenu(null);

  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Open any external link (e.g. Telegram) in the OS default browser
  // instead of inside the Electron window.
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    if (url !== mainWindow.webContents.getURL()) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

/* -----------------------------------------------------------
   Window control IPC handlers (used by the custom titlebar)
----------------------------------------------------------- */
ipcMain.on('window:minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window:maximize', () => {
  if (!mainWindow) return;
  if (mainWindow.isMaximized()) {
    mainWindow.unmaximize();
  } else {
    mainWindow.maximize();
  }
});

ipcMain.on('window:close', () => {
  if (mainWindow) mainWindow.close();
});

/* -----------------------------------------------------------
   App lifecycle
----------------------------------------------------------- */
app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

// Security hardening: block navigation to any external origin from
// within the main window itself (defence in depth alongside CSP).
app.on('web-contents-created', (_event, contents) => {
  contents.on('will-navigate', (event, navigationUrl) => {
    const parsedUrl = new URL(navigationUrl);
    const isLocalFile = parsedUrl.protocol === 'file:';
    if (!isLocalFile) {
      event.preventDefault();
    }
  });
});
