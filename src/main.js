const { app } = require('electron');
const electronSettings = require('electron-settings');

const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');
const FullscreenWindow = require('./fullscreen_window');

function main() {
  const url = electronSettings.get('url') || 'about:blank';
  const fullscreenWindow = new FullscreenWindow();

  fullscreenWindow.open(url);
}

app.on('ready', () => {
  logSystemDetails();

  loadConfigIntoSettings().then(() => {
    main();
  });
});
