const electronSettings = require('electron-settings');

const noop = require('../utils/noop');
const FullscreenWindow = require('../fullscreen_window');
const autolaunch = require('../autolaunch');
const keepAlive = require('../keep_alive');
const sleepBlocker = require('../sleep_blocker');
const notificationsBlocker = require('../notifications_blocker/');
const { restartShell } = require('../restart_shell/');
const focusAllWindows = require('../utils/focus_all_windows');

const {
  FULLSCREEN_IS_RUNNING,
} = require('../settings/attributes');

class FullscreenController {
  constructor({ onClose = noop } = {}) {
    this.stop = this.stop.bind(this);
    this.onClose = onClose;
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
      this.addCloseEvent();
    }
  }

  /**
   * Stop fullscreen mode.
   * @return {void}
   */
  stop() {
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
    notificationsBlocker.enableNotificationBlocker().then(() => {
      return restartShell();
    }).then(() => {
      setTimeout(focusAllWindows, 1000);
    }).catch((err) => {
      throw err;
    });
  }

  /**
   * Disable sleep blocking and keep alive.
   * @return {void}
   */
  stopProcesses() {
    electronSettings.set(FULLSCREEN_IS_RUNNING, false);
    sleepBlocker.disableSleepBlocking();
    keepAlive.disableKeepAlive();
    notificationsBlocker.disableNotificationBlocker().then(() => {
      return restartShell();
    }).then(() => {
      setTimeout(focusAllWindows, 1000);
    }).catch((err) => {
      throw err;
    });
  }

  /**
   * Add event that fires once the window is closed.
   * @return {void}
   */
  addCloseEvent() {
    const fullscreenWindow = this.fullscreenWindow.getWindow();
    fullscreenWindow.once('closed', this.onClose);
  }
}

module.exports = exports = FullscreenController;
