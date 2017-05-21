const electronSettings = require('electron-settings');

const FullscreenWindow = require('../fullscreen_window');
const autolaunch = require('../autolaunch');
const keepAlive = require('../keep_alive');
const sleepBlocker = require('../sleep_blocker');

const {
  FULLSCREEN_IS_RUNNING,
} = require('../settings/attributes');

/**
 * Return a function that creates a new bunyan instance and caches it.
 * @returns {function} Create bunyan instance.
 */
function getFullscreenWindowFactory() {
  let fullscreenWindow;

  return () => {
    // Check if fullscreenWindow in scope above exists.
    if (!fullscreenWindow) {
      fullscreenWindow = new FullscreenWindow();
    }

    return fullscreenWindow;
  };
}

/**
 * Check if fullscreen was active/running before.
 * @return {boolean} true if the `fullscreen_is_active` setting has not been
 * set to false.
 */
function wasFullscreenRunning() {
  return electronSettings.get(FULLSCREEN_IS_RUNNING);
}

/**
 * Check if fullscreen should start.
 * @return {boolean} true if autolaunch is enabled or fullscreen was
 * previously running.
 */
function shouldFullscreenStart() {
  return autolaunch.isAutoLaunchEnabled() ||
    module.exports.wasFullscreenRunning();
}

/**
 * Open fullscreen window with the config URL and binds an event for when
 * it closes.
 * @return {void}
 */
function openWindowAndBindEvents() {
  const url = electronSettings.get('url');

  module.exports.window.open(url);
  module.exports.window.getWindow().once('close', this.stop.bind(this));
}

/**
 * Start fullscreen mode.
 * @return {void}
 */
function start() {
  module.exports.openWindowAndBindEvents();

  electronSettings.set(FULLSCREEN_IS_RUNNING, true);
  sleepBlocker.enableSleepBlocking();
  keepAlive.enableKeepAlive();
}

/**
 * Stop fullscreen mode.
 * @return {void}
 */
function stop() {
  electronSettings.set(FULLSCREEN_IS_RUNNING, false);
  sleepBlocker.disableSleepBlocking();
  keepAlive.disableKeepAlive();
}

module.exports = {
  start,
  stop,
  wasFullscreenRunning,
  shouldFullscreenStart,
  openWindowAndBindEvents,
  getFullscreenWindowFactory,
};

Object.defineProperty(module.exports, 'window', {
  get: module.exports.getFullscreenWindowFactory(),
});
