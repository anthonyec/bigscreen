const fs = require('fs');
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
      'did-finish-load': this.onDidFinishLoad,
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

    // Remove menubar on win32.
    this.window.setMenu(null);

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
   * Loads the web page and clear the cache.
   * @returns {void}
   */
  load() {
    // TODO: Maybe make this optional or work out how to only cache bust
    // index.html.
    this.window.webContents.session.clearCache(() => {
      this.window.loadURL(this.url);
    });
  }

  /**
   * Toggle the dev tools.
   * @returns {void}
   */
  toggleDevTools() {
    this.window.toggleDevTools();
  }

  /**
   * Loads stylesheet and inserts the contents in the the webpage.
   * @returns {void}
   */
  injectCSS() {
    const stylesheetPath = path.join(__dirname, 'injected_styles.css');

    fs.readFile(stylesheetPath, 'utf8', (err, css) => {
      if (err) {
        throw (err);
      }

      this.window.webContents.insertCSS(css);
    });
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
   * Called when 'did-finish-load' event fires on the webContents.
   * @returns {void}
   */
  onDidFinishLoad() {
    this.injectCSS();
  }

  /**
   * Called when 'did-fail-load' event fires on the webContents.
   * @param {object} evt Error event.
   * @param {integer} errorCode Error code.
   * @param {object} errorDesc Description of error.
   * @param {string} url Resource URL.
   * @param {boolean} isMainFrame true if not resource that isn't main page.
   * @returns {void}
   */
  onDidFailToLoad(evt, errorCode, errorDesc, url, isMainFrame) {
    logger.log.error('did-fail-load', { url });

    // Only load fallback if the main paged failed to load. Allow resources of
    // the page to fail.
    if (isMainFrame) {
      this.openFallback();
    }
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
