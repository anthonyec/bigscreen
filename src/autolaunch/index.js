const AutoLaunch = require('auto-launch');
const electronSettings = require('electron-settings');

const { log } = require('../log');

const APP_NAME = electronSettings.get('name') || 'bigscreen';

const autoLauncher = new AutoLaunch({
  name: APP_NAME,
  mac: { useLaunchAgent: true },
});

function isAutoLaunchEnabled() {
  return electronSettings.get('autostart');
}

function enableAutoLaunch() {
  autoLauncher.enable().then(() => {
    electronSettings.set('autostart', true);
    log.info('autolaunch enabled');
  }).catch((err) => {
    log.error('failed to disabled auto launch', err);
  });
}

function disableAutoLaunch() {
  autoLauncher.disable().then(() => {
    electronSettings.set('autostart', false);
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
