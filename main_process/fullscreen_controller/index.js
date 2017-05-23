const electronSettings = require('electron-settings');

const FullscreenWindow = require('../fullscreen_window');
const autolaunch = require('../autolaunch');
const keepAlive = require('../keep_alive');
const sleepBlocker = require('../sleep_blocker');

const {
  FULLSCREEN_IS_RUNNING,
} = require('../settings/attributes');

class FullscreenController {
  /**
   * Check if fullscreen was active/running before.
   * @return {boolean} true if the `fullscreen_is_active` setting has not been
   * set to false.
   */
  wasFullscreenRunning() {
    return electronSettings.get(FULLSCREEN_IS_RUNNING);
  }

  /**
   * Check if fullscreen should start.
   * @return {boolean} true if autolaunch is enabled or fullscreen was
   * previously running.
   */
  shouldFullscreenStart() {
    return autolaunch.isAutoLaunchEnabled() || this.wasFullscreenRunning();
  }

  /**
   * Open fullscreen window with the config URL and binds an event for when
   * it closes.
   * @return {void}
   */
  openWindowAndBindEvents() {
    const url = electronSettings.get('url');

    this.fullscreenWindow = new FullscreenWindow();
    this.fullscreenWindow.open(url);

    this.window = this.fullscreenWindow.getWindow();
    this.window.once('close', this.stop.bind(this));
  }

  /**
   * Closes fullscreen window if it is open.
   * it closes.
   * @return {void}
   */
  closeWindow() {
    if (this.window) {
      this.fullscreenWindow.close();
    }
  }

  /**
   * Start fullscreen mode.
   * @return {void}
   */
  start() {
    if (!this.fullscreenWindow) {
      this.openWindowAndBindEvents();
      electronSettings.set(FULLSCREEN_IS_RUNNING, true);
      sleepBlocker.enableSleepBlocking();
      keepAlive.enableKeepAlive();
    }
  }

  /**
   * Stop fullscreen mode.
   * @return {void}
   */
  stop() {
    if (this.fullscreenWindow.getWindow()) {
      this.fullscreenWindow.close();
    }

    if (this.fullscreenWindow) {
      electronSettings.set(FULLSCREEN_IS_RUNNING, false);
      sleepBlocker.disableSleepBlocking();
      keepAlive.disableKeepAlive();
      delete this.fullscreenWindow;
    }
  }
}

module.exports = exports = new FullscreenController();
