const { app } = require('electron');
const AutoLaunch = require('auto-launch');
const electronSettings = require('electron-settings');

const logger = require('../log');

/**
 * Return a function that creates a new AutoLaunch instance and caches it.
 * @returns {function} Function to return a AutoLaunch instance.
 */
function getAutoLaunchFactory() {
  let autoLaunch;

  return () => {
    if (!app.isReady()) {
      throw new Error('Can\'t use autoLaunch before the app is ready.');
    }

    if (!autoLaunch) {
      autoLaunch = new AutoLaunch({
        name: electronSettings.get('name') || 'bigscreen',

        // On Mac use a .plist file inside ~/Library/LaunchAgents/<APP_NAME>.
        // Doing this because the other method opens a terminal console.
        mac: { useLaunchAgent: true },
      });
    }

    return autoLaunch;
  };
}

/**
 * Check if autolaunch is enabled.
 * @returns {boolean} true if autolaunch setting is set to true
 */
function isAutoLaunchEnabled() {
  return electronSettings.get('autolaunch');
}

/**
 * Enable app to start at login.
 * @returns {promise} Resolve if autoLaunch can create the system setting.
 */
function enableAutoLaunch() {
  const getAutoLaunchInstance = module.exports.getAutoLaunchFactory();

  return getAutoLaunchInstance().enable().then(() => {
    electronSettings.set('autolaunch', true);
    logger.log.info('autolaunch enabled');
  }).catch((err) => {
    logger.log.error('failed to enable auto launch', err);
    throw new Error(err);
  });
}

/**
 * Disable app from starting at login.
 * @returns {promise} Resolve if autoLaunch can remove the system setting.
 */
function disableAutoLaunch() {
  const getAutoLaunchInstance = module.exports.getAutoLaunchFactory();

  return getAutoLaunchInstance().disable().then(() => {
    electronSettings.set('autolaunch', false);
    logger.log.info('autolaunch disabled');
  }).catch((err) => {
    logger.log.error('failed to disabled auto launch', err);
    throw new Error(err);
  });
}

module.exports = {
  getAutoLaunchFactory,
  isAutoLaunchEnabled,
  enableAutoLaunch,
  disableAutoLaunch,
};
