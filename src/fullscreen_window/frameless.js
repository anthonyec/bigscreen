// Import electron to access `screen` module once app is ready to avoid throwing
const electron = require('electron');

const FullscreenWindow = require('./');

// Settings to override FullscreenWindow WINDOW_SETTINGS
const WINDOW_SETTINGS = {
  kiosk: false,
  frame: false,
};

// Extend default FullscreenWindow with different screen options
module.exports = class FramelessFullscreenWindow extends FullscreenWindow {
  /**
   * Returns settings for the electron BrowserWindow to be created.
   * @returns {object} - Extended settings
   */
  getWindowSettings() {
    return Object.assign(
      {},
      super.getWindowSettings(),
      WINDOW_SETTINGS
    );
  }

  /**
   * Returns smallest window height and accumulated window widths, that
   * represents the largest window that can be displayed.
   * @returns {object} size
   * @returns {number} size.width - Cumulative display width
   * @returns {number} size.height - Smallest display height
   */
  getWindowSize() {
    const displays = electron.screen.getAllDisplays();

    return displays.reduce((size, { workAreaSize }) => {
      size.width += workAreaSize.width;
      if (!size.height || workAreaSize.height < size.height) {
        size.height = workAreaSize.height;
      }
      return size;
    }, { width: 0, height: 0 });
  }

  /**
   * Returns left-most display position and lowest-y position, so the window
   * will be positioned properly.
   * @returns {object} position
   * @returns {number} position.x - Lowest (furthest left) display x position
   * @returns {number} position.y - Greatest (most bottom) display y position
   */
  getWindowPosition() {
    const displays = electron.screen.getAllDisplays();

    return displays.reduce((size, { workArea }) => {
      if (workArea.x < size.x) {
        size.x = workArea.x;
      }
      if (workArea.y > size.y) {
        size.y = workArea.y;
      }
      return size;
    }, { x: 0, y: 0 });
  }

  /**
   * Calls parent (FullscreenWindow) `open` method and immediately resizes and
   * positions window with calculated maximum size/position.
   * @param {string} url - URL to open in new BrowserWindow
   * @returns {Promise} - Promise that will resolve once web page opened
   *                      successfully.
   */
  open(url) {
    const promise = super.open(url);

    // The bounds object containing the width/height and x/y position for the
    // BrowserWindow
    const bounds = Object.assign(
      {},
      this.getWindowSize(),
      this.getWindowPosition()
    );

    // We have to call setBounds after creating the BrowserWindow instead of
    // specifying the x/y and width/height on instantiation as electron will not
    // position across displays correctly when the window is created
    this.window.setBounds(bounds);

    return promise;
  }
};
