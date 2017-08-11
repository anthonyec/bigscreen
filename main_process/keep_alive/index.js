const os = require('os');

const keepAliveDarwin = require('./darwin');

/**
 * Get the OS platform name.
 * @return {string} Platform name.
 */
function getPlatform() {
  return os.platform();
}

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

  if (platform === 'darwin') {
    return {
      enableKeepAlive: keepAliveDarwin.enableKeepAlive,
      disableKeepAlive: keepAliveDarwin.disableKeepAlive,
    };
  }

  return {
    // Return fake functions that always resolve.
    enableKeepAlive: module.exports.dummyMethod,
    disableKeepAlive: module.exports.dummyMethod,
  };
}

module.exports.getPlatformAPI = getPlatformAPI;
module.exports.dummyMethod = dummyMethod;
module.exports.getPlatform = getPlatform;
module.exports = Object.assign(module.exports, getPlatformAPI());
