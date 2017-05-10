const AutoLaunch = require('auto-launch');
const electronSettings = require('electron-settings');

const { log } = require('../log');

const APP_NAME = electronSettings.get('name') || 'bigscreen';

const autoLauncher = new AutoLaunch({
  name: APP_NAME,
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
 * @returns {void}
 */
function enableAutoLaunch() {
  autoLauncher.enable().then(() => {
    electronSettings.set('autolaunch', true);
    log.info('autolaunch enabled');
  }).catch((err) => {
    log.error('failed to disabled auto launch', err);
  });
}

/**
 * Disable app from starting at login.
 * @returns {void}
 */
function disableAutoLaunch() {
  autoLauncher.disable().then(() => {
    electronSettings.set('autolaunch', false);
    log.info('autolaunch disabled');
  }).catch((err) => {
    log.error('failed to disabled auto launch', err);
  });
}

module.exports = {
  isAutoLaunchEnabled,
  enableAutoLaunch,
  disableAutoLaunch,
};
