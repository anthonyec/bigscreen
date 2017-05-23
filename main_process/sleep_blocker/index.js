const { powerSaveBlocker } = require('electron');

const electronSettings = require('electron-settings');

/**
 * Start preventing the computer from sleeping.
 * @returns {void}
 */
function enableSleepBlocking() {
  module.exports.id = powerSaveBlocker.start('prevent-display-sleep');
  electronSettings.set('sleep_blocking', true);
}

/**
 * Stop preventing the computer from sleeping.
 * @returns {void}
 */
function disableSleepBlocking() {
  const sleepID = module.exports.id;

  if (sleepID) {
    powerSaveBlocker.stop(sleepID);
    electronSettings.set('sleep_blocking', false);
    module.exports.id = null;
  }
}

module.exports = {
  id: null,
  enableSleepBlocking,
  disableSleepBlocking,
};
