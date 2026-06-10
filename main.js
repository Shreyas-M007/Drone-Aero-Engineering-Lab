const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// Remove the default menu bar for a clean app look
Menu.setApplicationMenu(null);

function createWindow() {
  const win = new BrowserWindow({
    width: 1400,
    height: 900,
    minWidth: 1024,
    minHeight: 700,
    title: 'Aero Lab',
    backgroundColor: '#FAF8F5',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    },
    show: false
  });

  win.loadFile('index.html');

  // Show window once content is ready to avoid white flash
  win.once('ready-to-show', () => {
    win.show();
  });

  // Set window title explicitly (overrides HTML <title>)
  win.on('page-title-updated', (e) => {
    e.preventDefault();
    win.setTitle('Aero Lab');
  });
}

// App lifecycle
app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  // On macOS, apps stay active until Cmd+Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On macOS, re-create window when dock icon is clicked
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});
