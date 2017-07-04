const path = require('path');

const { BrowserWindow, globalShortcut, ipcMain } = require('electron');

const { poll } = require('../poll_url');
const logger = require('../log');
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
  open(url) {
    const settings = this.getWindowSettings();
    this.url = url;

    this.window = new BrowserWindow(settings);
    this.load();

    // Add webContents and window event handlers.
    this.addWindowEvents();
    this.registerShortcuts();

    // Event that gets fired when console methods are called, i.e console.log.
    // These events come from the preload script.
    ipcMain.on('window_log', this.onWebContentsLog);
  }

  /**
   * Close the kiosk window and unregister shortcuts.
   * @returns {void}
   */
  close() {
    // The electron app will remain in kiosk mode unless this is set to false
    // before closing. Maybe it's an electron bug?
    this.window.setKiosk(false);
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
    logger.log.error('attempting to reconnect');

    poll(this.url, () => {
      logger.log.info('reconnected!');
      this.load();
    }, (retry) => {
      logger.log.error('reconnected failed, trying again...');
      retry();
    });
  }

  /**
   * Load the fallback content and start attempting to reconnect
   * in the background.
   * @returns {void}
   */
  openFallback() {
    const fallbackURL = path.join('file://', FALLBACK_PATH);
    this.window.loadURL(fallbackURL);
    this.attemptToReconnect();
  }

  /**
   * Called when 'window_log' event fires from the webContents preload script.
   * @param {object} evt Object with details of the ipcMain event.
   * @param {object} args Arguments from the console method.
   * @returns {void}
   */
  onWebContentsLog(evt, args) {
    logger.log.debug(args);
  }

  /**
   * Called when 'did-fail-to-load' event fires on the webContents.
   * @returns {void}
   */
  onDidFailToLoad() {
    logger.log.error('did-fail-load');
    this.openFallback();
  }

  /**
   * Called when 'certificate-error' event fires on the webContents.
   * @returns {void}
   */
  onCertificateError() {
    logger.log.warn('certificate-error');
  }

  /**
   * Called when 'crashed' event fires on the webContents.
   * @returns {void}
   */
  onCrashed() {
    logger.log.error('crashed');
    this.load();
  }

  /**
   * Called when 'unresponsive' event fires on the window. This can take up to
   * 30 seconds to trigger.
   * @returns {void}
   */
  onUnresponsive() {
    logger.log.error('unresponsive');
    this.load();
  }

  /**
   * Called when 'gpu-process-crashed' event fires on the window.
   * @returns {void}
   */
  onGPUCrashed() {
    logger.log.error('gpu-process-crashed');
    this.load();
  }
};
