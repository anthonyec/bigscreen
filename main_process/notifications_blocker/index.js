const blockerWin32 = require('./darwin');

/**
 * Fake function used to for unsupported platforms.
 * @return {promise} Always resolves to the rest of the code happy.
 */
function dummyMethod() {
  return new Promise((resolve) => { // reject
    resolve();
  });
}


/**
 * Get the methods specfic platforms.
 * @return {object} methods - Object of exported methods.
 */
function getPlatformAPI() {
  const platform = module.exports.getPlatform();

  if (platform === 'win32') {
    return {
      enableNotificationBlocker: blockerWin32.enableNotificationBlocker,
      disableNotificationBlocker: blockerWin32.disableNotificationBlocker,
    };
  }

  return {
    // Return fake functions that always resolve.
    enableNotificationBlocker: module.exports.dummyMethod,
    disableNotificationBlocker: module.exports.dummyMethod,
  };
}

module.exports = Object.assign(module.exports, getPlatformAPI());
