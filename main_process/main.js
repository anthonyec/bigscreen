const { app, BrowserWindow, ipcMain } = require('electron');

const fullscreenController = require('./fullscreen_controller');
const PreferencesWindow = require('./preferences_window');
const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');
const { disableSleepBlocking } = require('./sleep_blocker');

let preferencesWindow;
let fullscreenWindow;

function main() {
  preferencesWindow = new PreferencesWindow();

  if (fullscreenController.shouldFullscreenStart()) {
    fullscreenController.start();
  } else {
    preferencesWindow.open();

    ipcMain.on('START_FULLSCREEN', () => {
      preferencesWindow.close();
      fullscreenController.start();

      fullscreenWindow =
        fullscreenController.fullscreenWindow.getWindow();

      fullscreenWindow.once('closed', () => {
        preferencesWindow.open();
      });
    });
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
