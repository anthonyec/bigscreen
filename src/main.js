const { app } = require('electron');
const electronSettings = require('electron-settings');

const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');
const FullscreenWindow = require('./fullscreen_window');
const {
  enableSleepBlocking,
  disableSleepBlocking,
} = require('./sleep_blocker');

function main() {
  const url = electronSettings.get('url') || 'about:blank';
  const fullscreenWindow = new FullscreenWindow();

  fullscreenWindow.open(url);
  enableSleepBlocking();
}

// Make sure the main background process is stopped when no windows are open.
// Fixes the problem of multiple processes spawning on Windows.
app.on('window-all-closed', () => {
  app.quit();
});

app.on('quit', () => {
  disableSleepBlocking();
});

app.on('ready', () => {
  logSystemDetails();

  loadConfigIntoSettings().then(() => {
    main();
  });
});
