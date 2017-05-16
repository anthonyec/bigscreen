const path = require('path');

const { BrowserWindow, globalShortcut, ipcMain } = require('electron');

const { poll } = require('../poll_url');
const { log } = require('../log');
const { FALLBACK_PATH } = require('../settings/paths');

const WINDOW_SETTINGS = {
  backgroundColor: '#000000',
  kiosk: true,
  webPreferences: {
    webgl: true,
    backgroundThrottling: false,

    // This will be loaded before other scripts run in the web page.
    // Preload scripts have access to node.js and electron APIs.
    preload: path.join(__dirname, 'preload.js'),
  },
};

module.exports = class FullscreenWindow {
  constructor() {
    this.window = null;
    this.url = '';

    // These shortcuts are free to use on Windows and make sense on macOS.
    this.shortcuts = {
      'CommandOrControl+W': this.close,
      'CommandOrControl+R': this.load,
    };

    this.webContentsEvents = {
      'did-fail-load': this.onDidFailToLoad,
      'certificate-error': this.onCertificateError,
      crashed: this.onCrashed,
    };

    this.windowEvents = {
      unresponsive: this.onUnresponsive,
      'gpu-process-crashed': this.onGPUCrashed,
    };
  }

  /**
   * Get the BrowserWindow instance.
   * @returns {object} Instance of the electron BrowserWindow.
   */
  getWindow() {
    return this.window;
  }

  getWindowSettings() {
    return WINDOW_SETTINGS;
  }

  /**
   * Open a URL in a fullscreen kiosk window
   * @param {url} url Web page to display.
   * @returns {promise} Resolve if web page opened successfully.
   */
  open(url) {
    this.url = url;
    this.registerShortcuts();

    const settings = this.getWindowSettings();

    return new Promise((resolve) => { // reject
      this.window = new BrowserWindow(settings);
      this.load();

      // Add webContents and window event handlers.
      this.addWindowEvents();

      // Event that gets fired when console methods are called, i.e console.log.
      // These events come from the preload script.
      ipcMain.on('window_log', (evt, args) => {
        log.debug(args);
      });

      resolve();
    });
  }

  /**
   * Close the kiosk window and unregister shortcuts.
   * @returns {void}
   */
  close() {
    this.window.close();
    this.unregisterShortcuts();
    this.window = null;
  }

  /**
   * Loads the web page
   * @returns {void}
   */
  load() {
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
    shortcuts.forEach((shortcut) => {
      globalShortcut.unregister(shortcut);
    });
  }

  /**
   * Add handlers to window and webContents events.
   * @returns {void}
   */
  addWindowEvents() {
    const webContentsEvents = Object.keys(this.webContentsEvents);
    const windowEvents = Object.keys(this.windowEvents);

    webContentsEvents.forEach((event) => {
      const handler = this.webContentsEvents[event];
      this.window.webContents.on(event, handler.bind(this));
    });

    windowEvents.forEach((event) => {
      const handler = this.windowEvents[event];
      this.window.on(event, handler.bind(this));
    });
  }

  /**
   * Polls URL until a connection is made.
   * @returns {void}
   */
  attemptToReconnect() {
    log.error('attempting to reconnect');

    poll(this.url, () => {
      log.info('reconnected!');
      this.load();
    }, (retry) => {
      log.error('reconnected failed, trying again...');
      retry();
    });
  }

  openFallback() {
    const fallbackURL = path.join('file://', FALLBACK_PATH);
    this.window.loadURL(fallbackURL);
    this.attemptToReconnect();
  }

  /**
   * Called when 'did-fail-to-load' event fires on the webContents.
   * @returns {void}
   */
  onDidFailToLoad() {
    log.error('did-fail-load');
    this.openFallback();
  }

  /**
   * Called when 'certificate-error' event fires on the webContents.
   * @returns {void}
   */
  onCertificateError() {
    log.warn('certificate-error');
  }

  /**
   * Called when 'crashed' event fires on the webContents.
   * @returns {void}
   */
  onCrashed() {
    log.error('crashed');
    this.load();
  }

  /**
   * Called when 'unresponsive' event fires on the window. This can take up to
   * 30 seconds to trigger.
   * @returns {void}
   */
  onUnresponsive() {
    log.error('unresponsive');
    this.load();
  }

  /**
   * Called when 'gpu-process-crashed' event fires on the window.
   * @returns {void}
   */
  onGPUCrashed() {
    log.error('gpu-process-crashed');
    this.load();
  }
};
