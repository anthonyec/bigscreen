const os = require('os');

const noopPromise = require('./noop_promise');

/**
 * Get the methods for a specific platforms. Defaults too a noop function so it
 * runs without fuss on a unsupported OS.
 * @param {object} api - Object of methods grouped by the OS.
 * @param {function} noopFunction - Optional function to use as the default
 * method.
 * @return {object} methods - Object of exported methods.
 */
function getPlatformAPI(api, noopFunction = noopPromise) {
  const platform = os.platform();

  // Check if methods are provided for the current OS.
  const hasSystemAPI = api[platform];

  // Get any group of methods to use as the keys for the default.
  const firstPlatformKey = Object.keys(api)[0];
  const defaultMethods = Object.keys(api[firstPlatformKey]);

  if (hasSystemAPI) {
    return api[platform];
  }

  return defaultMethods.reduce((obj, method) => {
    // Fake function used to for unsupported platforms.
    obj[method] = noopFunction;
    return obj;
  }, {});
}

module.exports = exports = getPlatformAPI;
