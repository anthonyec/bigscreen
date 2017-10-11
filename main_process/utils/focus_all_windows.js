const { BrowserWindow } = require('electron');

/**
 * Focus all open windows.
 * @return {void}
 */
function focusAllWindows() {
  const windows = BrowserWindow.getAllWindows();

  windows.forEach((window) => {
    window.focus();
  });
}

module.exports = exports = focusAllWindows;
