const { powerSaveBlocker } = require('electron');

const electronSettings = require('electron-settings');

let id;

/**
 * Get the ID of the sleep blocker.
 * @returns {integer} id of the sleep blocker
 */
function getID() {
  return id;
}

/**
 * Start preventing the computer from sleeping.
 * @returns {void}
 */
function startSleepBlocking() {
  id = powerSaveBlocker.start('prevent-display-sleep');
  electronSettings.set('sleep_blocking', true);
}

/**
 * Stop preventing the computer from sleeping.
 * @returns {void}
 */
function stopSleepBlocking() {
  const sleepID = module.exports.getID();

  if (sleepID) {
    powerSaveBlocker.stop(sleepID);
    electronSettings.set('sleep_blocking', false);
  }
}

module.exports = {
  getID,
  startSleepBlocking,
  stopSleepBlocking,
};
