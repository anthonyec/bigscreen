const { app, BrowserWindow } = require('electron');
const electronSettings = require('electron-settings');

const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');
const FullscreenWindow = require('./fullscreen_window');

function main() {
  // const url = electronSettings.get('url') || 'about:blank';
  // const fullscreenWindow = new FullscreenWindow();

  // fullscreenWindow.open(url);

  const preferencesWindow = new BrowserWindow({
    background: '#ECECEC',
    title: electronSettings.get('name') + ' preferences',
    useContentSize: true,
    width: 450,
    height: 215,
    resizable: true,
    show: false,
  });
  preferencesWindow.loadURL(`file://${__dirname}/ui/index.html`);

  preferencesWindow.on('ready-to-show', preferencesWindow.show);
}

app.on('ready', () => {
  logSystemDetails();

  loadConfigIntoSettings().then(() => {
    main();
  });
});
