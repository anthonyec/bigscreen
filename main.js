const electronSettings = require('electron-settings');
const { app, BrowserWindow, ipcMain, Menu } = require('electron');

const fullscreenController = require('./main_process/fullscreen_controller');
const PreferencesWindow = require('./main_process/preferences_window');
const { loadConfigIntoSettings } = require('./main_process/settings');
const { logSystemDetails } = require('./main_process/log');
const { disableSleepBlocking } = require('./main_process/sleep_blocker');
const DEFAULT_MENU = require('./main_process/menu_templates/default_menu');

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

    ipcMain.on('UPDATE_WEB_ADDRESS', (evt, action) => {
      electronSettings.set('url', action.url);
    });
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(DEFAULT_MENU));
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
