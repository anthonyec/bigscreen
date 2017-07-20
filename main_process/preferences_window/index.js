const { app, BrowserWindow, Menu } = require('electron');

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
  constructor() {
    const path = app.getAppPath('exe');

    this.window = null;
    this.url = IS_DEV_ENV ?
      'http://lvh.me:8080/' :
      `file://${path}/renderer_process/dist/index.html`;
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
   * @param {url} url Web page to display.
   * @returns {void}
   */
  onContextMenu(e, props) {
    console.log('onContextMenu');


    // Electron disables ALL context menus by default. Some may say this is
    // good, others may say not. But hmmmm....
    // https://github.com/electron/electron/issues/4068
    const inputContextMenu = Menu.buildFromTemplate([{
        label: 'Undo',
        role: 'undo',
      },
      {
          label: 'Redo',
          role: 'redo',
      },
      {
          type: 'separator',
      },
      {
          label: 'Cut',
          role: 'cut',
      },
      {
          label: 'Copy',
          role: 'copy',
      },
      {
          label: 'Paste',
          role: 'paste',
      },
      {
          type: 'separator',
      },
      {
          label: 'Select all',
          role: 'selectall',
      },
    ]);

    const { inputFieldType } = props;

    if (inputFieldType === 'plainText') {
      inputContextMenu.popup(this.window);
    }
  }
};
