const { app } = require('electron');

const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');

const fullscreenController = require('./fullscreen_controller');
const { disableSleepBlocking } = require('./sleep_blocker');

function main() {
  if (fullscreenController.shouldFullscreenStart()) {
    fullscreenController.start();
  } else {

    // open preferences_window
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
app.on('window-all-closed', app.quit);
app.on('will-quit', cleanUpBeforeQuitting);
app.on('ready', boot);
