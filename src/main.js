const electron = require('electron');

const { settings, loadConfigIntoSettings } = require('./settings');

const app = electron.app;
const BrowserWindow = electron.BrowserWindow;

function main() {
  const mainWindow = new BrowserWindow({
    resizable: process.env.NODE_ENV === 'development',
  });

  mainWindow.loadURL(`file://${__dirname}/index.html`);

  mainWindow.on('ready-to-show', () => {
    mainWindow.show();
  });

  if (process.env.NODE_ENV === 'development') {
    mainWindow.openDevTools({ detach: true });
  }
}

app.on('ready', () => {
  loadConfigIntoSettings().then(() => {
    main();
  });
});
