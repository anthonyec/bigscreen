const os = require('os');

const keepAliveDarwin = require('./darwin');

const PLATFORM = os.platform();

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
 * Get the methods specfic playforms.
 * @return {object} methods - Object of exported methods.
 */
function getPlatformAPI() {
  if (PLATFORM === 'darwin') {
    return {
      enableKeepAlive: keepAliveDarwin.enableKeepAlive,
      disableKeepAlive: keepAliveDarwin.disableKeepAlive,
    };
  }

  console.warn(`keep_alive is not yet supported for ${PLATFORM}, sorry.`);

  return {
    // Return fake functions that always resolve.
    enableKeepAlive: dummyMethod,
    disableKeepAlive: dummyMethod,
  };
}

module.exports = getPlatformAPI();
