const fs = require('fs');

const request = require('request');

let timeout;
const FILE_URI_SCHEME = 'file://';
const FILE_URI_REGEX = /^file:\/\//g;

/**
 * Check if the url has `file://` at the start.
 * @param {string} url URL to check.
 * @returns {boolean} true if the url has "file://" at the start.
 */
function isFileURIScheme(url) {
  return url.slice(0, FILE_URI_SCHEME.length) === FILE_URI_SCHEME;
}

/**
 * Remove `file://` from the start of a url.
 * @param {string} url URL to remove file schema from.
 * @returns {string} url URL without the file schema at the start.
 */
function removeFileURIScheme(url) {
  return url.replace(FILE_URI_REGEX, '');
}

/**
 * Check if a file exists.
 * @param {string} url URL of the file to check.
 * @param {function} successCallback Called if the file exists.
 * @param {function} failedCallback Called if there is an
 * error retrieving the file.
 * @returns {void}
 */
function checkFileExists(url, successCallback, failedCallback) {
  fs.stat(module.exports.removeFileURIScheme(url), (err) => {
    if (err) {
      failedCallback();
    } else {
      successCallback();
    }
  });
}

/**
 * Check if a successful request can be made to a URL that returns 200.
 * @param {string} url URL to check.
 * @param {function} successCallback Called if the file exists.
 * @param {function} failedCallback Called if there is an
 * error retrieving the file.
 * @returns {void}
 */
function checkRequestExists(url, successCallback, failedCallback) {
  // Using request.get because it's hard to stub request function directly.
  // See http://stackoverflow.com/a/20090180.
  request.get(url, (err, response) => {
    if (err || (response && response.statusCode !== 200)) {
      failedCallback();
    } else {
      successCallback();
    }
  });
}

/**
 * Call poll function after a timeout.
 * @param {string} url URL to check.
 * @param {function} successCallback Called if the URL can be retrieved.
 * @param {function} failedCallback Called if there is an
 * error retrieving the URL.
 * @returns {void}
 */
function callPollAfterTimeout(url, successCallback, failedCallback) {
  // Using a timeout because sometimes a poll can fail instantly,
  // so we don't wanna spam too much.
  clearTimeout(timeout);

  // TODO: change to incremental timer, i.e (1s, 2s, 3s, 5, 8, 13, 21... 60).
  timeout = setTimeout(() => {
    module.exports.poll(url, successCallback, failedCallback);
  }, 1000);
}

/**
 * Check a URL of a file or website to see if it can be retrieved.
 * @param {string} url URL to check.
 * @param {function} successCallback Called if the URL can be retrieved.
 * @param {function} failedCallback Called if there is an
 * error retrieving the URL.
 * @returns {void}
 */
function poll(url, successCallback, failedCallback) {
  // Use a different method for checking depending on if the URL is a
  // file path or web address.
  const chosenPollMethod = module.exports.isFileURIScheme(url) ?
    module.exports.checkFileExists :
    module.exports.checkRequestExists;

  // Create the retry callback function.
  const retry = () =>
    module.exports.callPollAfterTimeout.apply(this, arguments);

  // // Call the chosen poll method.
  chosenPollMethod(url, () => {
    successCallback(retry);
  }, () => {
    failedCallback(retry);
  });
}

module.exports = {
  isFileURIScheme,
  removeFileURIScheme,
  checkFileExists,
  checkRequestExists,
  callPollAfterTimeout,
  poll,
};
