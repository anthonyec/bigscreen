const electronSettings = require('electron-settings');

const FullscreenWindow = require('../fullscreen_window');
const autolaunch = require('../autolaunch');
const keepAlive = require('../keep_alive');
const sleepBlocker = require('../sleep_blocker');

const {
  FULLSCREEN_IS_RUNNING,
} = require('../settings/attributes');

class FullscreenController {
  constructor() {
    this.stop = this.stop.bind(this);
  }

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
  openWindow() {
    const url = electronSettings.get('url');

    this.fullscreenWindow = new FullscreenWindow();
    this.fullscreenWindow.open(url);

    this.fullscreenWindow.getWindow().once('close', () => {
      this.stopProcesses();
      delete this.fullscreenWindow;
    });
  }

  /**
   * Closes fullscreen window.
   * @return {void}
   */
  closeWindow() {
    this.fullscreenWindow.close();
  }

  /**
   * Start fullscreen mode.
   * @return {void}
   */
  start() {
    if (!this.fullscreenWindow) {
      this.openWindow();
      this.startProcesses();
    }
  }

  /**
   * Stop fullscreen mode.
   * @return {void}
   */
  stop() {
    // return;
    if (this.fullscreenWindow && this.fullscreenWindow.getWindow()) {
      this.closeWindow();
    }
  }

  /**
   * Enable sleep blocking and keep alive.
   * @return {[type]} [description]
   */
  startProcesses() {
    electronSettings.set(FULLSCREEN_IS_RUNNING, true);
    sleepBlocker.enableSleepBlocking();
    keepAlive.enableKeepAlive();
  }

  /**
   * Disable sleep blocking and keep alive.
   * @return {void}
   */
  stopProcesses() {
    electronSettings.set(FULLSCREEN_IS_RUNNING, false);
    sleepBlocker.disableSleepBlocking();
    keepAlive.disableKeepAlive();
  }
}

module.exports = exports = new FullscreenController();
