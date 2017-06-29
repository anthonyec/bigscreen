const { app, BrowserWindow, ipcMain } = require('electron');
const electronSettings = require('electron-settings');

const fullscreenController = require('./fullscreen_controller');
const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');
const { disableSleepBlocking } = require('./sleep_blocker');

let preferencesWindow;

function showPreferencesWindow() {
  preferencesWindow = new BrowserWindow({
    background: '#ECECEC',
    title: `${electronSettings.get('name') } preferences`,
    useContentSize: true,
    width: 450,
    height: 215,
    resizable: true,
    show: false,
    kiosk: false,
  });

  const path = app.getAppPath('exe');
  const baseURL = process.env.NODE_ENV === 'development' ?
    'http://lvh.me:8080/' :
    `file://${path}/renderer_process/dist/index.html`;

  preferencesWindow.loadURL(baseURL);
  preferencesWindow.on('ready-to-show', preferencesWindow.show);
}

function main() {
  if (fullscreenController.shouldFullscreenStart()) {
    fullscreenController.start();
  } else {
    showPreferencesWindow();

    ipcMain.on('start_fullscreen', () => {
      fullscreenController.start();
      preferencesWindow.close();

      fullscreenController.fullscreenWindow.window.once('closed', () => {
        showPreferencesWindow();
      });
    });

    if (process.env.NODE_ENV === 'development') {
      preferencesWindow.openDevTools({ detach: true });
    }
  }
}

function cleanUpBeforeQuitting() {
  disableSleepBlocking();
}

function boot() {
  logSystemDetails();

  loadConfigIntoSettings().then(() => {
    main();
  });
}

// Make sure the main background process is stopped when no windows are open.
// Fixes the problem of multiple processes spawning on Windows.
app.on('window-all-closed', (evt) => {
  evt.preventDefault();

  // Event needs one tick before getAllWindows().length is accurate.
  setTimeout(() => {

    // This event gets called when closing kiosk and opening preferences so
    // double check there are really no windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      app.quit();
    }
  });
});
app.on('will-quit', cleanUpBeforeQuitting);
app.on('ready', boot);
