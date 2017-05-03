const { BrowserWindow, globalShortcut } = require('electron');

module.exports = class FullscreenWindow {
  constructor() {
    this.window = null;
    this.url = '';

    this.shortcuts = {
      Q: this.close,
      R: this.reload,
    };

    this.registerShortcuts();
  }

  /**
   * Get the BrowserWindow instance.
   * @returns {object} Instance of the electron BrowserWindow.
   */
  getWindow() {
    return this.window;
  }

  /**
   * Open a URL in a fullscreen kiosk window
   * @param {url} url Web page to display.
   * @returns {promise} Resolve if web page opened successfully.
   */
  open(url) {
    this.url = url;

    return new Promise((resolve) => { // reject
      this.window = new BrowserWindow({
        backgroundColor: '#000000',
        kiosk: true,
        webPreferences: {
          webgl: true,
          backgroundThrottling: false,
        },
      });

      this.window.loadURL(this.url);

      this.window.on('show', resolve);

      this.window.on('closed', () => {
        this.window = null;
      });
    });
  }

  /**
   * Close the kiosk window and unregister shortcuts.
   * @returns {void}
   */
  close() {
    this.window.close();
    this.unregisterShortcuts();
  }

  /**
   * Reload the web page.
   * @returns {void}
   */
  reload() {
    this.window.loadURL(this.url);
  }

  /**
   * Creates global shortcuts.
   * @returns {void}
   */
  registerShortcuts() {
    const shortcuts = Object.keys(this.shortcuts);

    shortcuts.forEach((shortcut) => {
      const method = this.shortcuts[shortcut];
      globalShortcut.register(shortcut, method.bind(this));
    });
  }

  /**
   * Removed global shortcuts that were registered.
   * @returns {void}
   */
  unregisterShortcuts() {
    const shortcuts = Object.keys(this.shortcuts);
    shortcuts.forEach(globalShortcut.unregister);
  }
};
