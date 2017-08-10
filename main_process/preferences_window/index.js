const { app, BrowserWindow, Menu, ipcMain } = require('electron');
const INPUT_CONTEXT_MENU = require('../menu_templates/input_context');

const noop = require('../utils/noop');
const { enableAutoLaunch, disableAutoLaunch } = require('../autolaunch');

const IS_DEV_ENV = process.env.NODE_ENV === 'development';
const WINDOW_SETTINGS = {
  useContentSize: true,
  width: 450,
  height: 180,
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
    this.window.webContents.on('context-menu', this.onContextMenu);

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

  /**
   * Add handler to webContext right click event.
   * @param {evt} evt Input DOM event.
   * @param {props} props Event props.
   * @returns {void}
   */
  onContextMenu(evt, props) {
    const { inputFieldType } = props;

    // Electron disables ALL context menus by default. Some may say this is
    // good, others may say not. But hmmmm....
    // https://github.com/electron/electron/issues/4068
    const inputContextMenu = Menu.buildFromTemplate(INPUT_CONTEXT_MENU);

    if (inputFieldType === 'plainText') {
      inputContextMenu.popup(this.window);
    }
  }
};
