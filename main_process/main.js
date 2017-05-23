const { app, BrowserWindow } = require('electron');
const electronSettings = require('electron-settings');

const { loadConfigIntoSettings } = require('./settings');
const { logSystemDetails } = require('./log');

function main() {
  const preferencesWindow = new BrowserWindow({
    background: '#ECECEC',
    title: `${electronSettings.get('name') } preferences`,
    useContentSize: true,
    width: 450,
    height: 215,
    resizable: true,
    show: false,
  });

  const path = app.getAppPath('exe');
  const baseURL = process.env.NODE_ENV === 'development' ?
    'http://lvh.me:8080/' :
    `file://${path}/renderer_process/dist/index.html`;

  preferencesWindow.loadURL(baseURL);

  preferencesWindow.on('ready-to-show', preferencesWindow.show);

  if (process.env.NODE_ENV === 'development') {
    preferencesWindow.openDevTools({ detach: true });
  }
}

app.on('ready', () => {
  logSystemDetails();

  loadConfigIntoSettings().then(() => {
    main();
  });
});
