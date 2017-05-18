const AutoLaunch = require('auto-launch');

const electronSettings = require('electron-settings');

const { log } = require('../log');

const APP_NAME = electronSettings.get('name') || 'bigscreen';

const autoLaunch = new AutoLaunch({
  name: APP_NAME,

  // On Mac use a .plist file inside ~/Library/LaunchAgents/<APP_NAME>.
  // Doing this because the other method opens a terminal console.
  mac: { useLaunchAgent: true },
});

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
  return autoLaunch.enable().then(() => {
    electronSettings.set('autolaunch', true);
    log.info('autolaunch enabled');
  }).catch((err) => {
    log.error('failed to enable auto launch', err);
    throw new Error(err);
  });
}

/**
 * Disable app from starting at login.
 * @returns {promise} Resolve if autoLaunch can remove the system setting.
 */
function disableAutoLaunch() {
  return autoLaunch.disable().then(() => {
    electronSettings.set('autolaunch', false);
    log.info('autolaunch disabled');
  }).catch((err) => {
    log.error('failed to disabled auto launch', err);
    throw new Error(err);
  });
}

module.exports = {
  isAutoLaunchEnabled,
  enableAutoLaunch,
  disableAutoLaunch,
};
