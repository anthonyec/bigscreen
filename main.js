const { app, BrowserWindow } = require('electron');

const WindowController = require('./main_process/window_controller');
const { loadConfigIntoSettings } = require('./main_process/settings');
const { logSystemDetails } = require('./main_process/log');
const { disableSleepBlocking } = require('./main_process/sleep_blocker');

function main() {
  const windowController = new WindowController();
  windowController.startup();
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
