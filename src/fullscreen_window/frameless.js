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
  // Returns settings for the electron BrowserWindow to be created
  getWindowSettings() {
    return Object.assign(
      {},
      super.getWindowSettings(),
      WINDOW_SETTINGS
    );
  }

  // Returns smallest window height and accumulated window widths
  // This represents the largest window that can be displayed
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

  // Returns left-most display position and lowest-y position, so the window
  // will be positioned properly
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

  open(url) {
    super.open(url);

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
  }
};
