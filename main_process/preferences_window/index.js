const { app, BrowserWindow, ipcMain } = require('electron');

const noop = require('../utils/noop');
const { enableAutoLaunch, disableAutoLaunch } = require('../autolaunch');

const IS_DEV_ENV = process.env.NODE_ENV === 'development';
const WINDOW_SETTINGS = {
  useContentSize: true,
  width: 450,
  height: 215,
  resizable: IS_DEV_ENV,
  show: false,
  kiosk: false,
};

module.exports = class PreferencesWindow {
  constructor({ onStartFullscreen = noop } = {}) {
    const exePath = app.getAppPath('exe');

    this.window = null;
    this.url = IS_DEV_ENV ?
      'http://lvh.me:8080/' :
      `file://${exePath}/renderer_process/dist/index.html`;

    ipcMain.on('START_FULLSCREEN', () => {
      onStartFullscreen();
      this.close();
    });
    ipcMain.on('ENABLE_AUTO_LAUNCH', enableAutoLaunch);
    ipcMain.on('DISABLE_AUTO_LAUNCH', disableAutoLaunch);
  }

  /**
   * Returns the windows settings.
   * @returns {object} Object containing the settings.
   */
  getWindowSettings() {
    return WINDOW_SETTINGS;
  }

  /**
   * Open a URL in a fullscreen kiosk window.
   * @param {url} url Web page to display.
   * @returns {void}
   */
  open() {
    const settings = this.getWindowSettings();

    this.window = new BrowserWindow(settings);
    this.window.loadURL(this.url);

    this.window.on('ready-to-show', this.window.show);

    if (IS_DEV_ENV) {
      this.window.openDevTools({ detach: true });
    }
  }

  /**
   * Close the kiosk window and unregister shortcuts.
   * @returns {void}
   */
  close() {
    this.window.close();
    this.window = null;
  }
};
