const os = require('os');
const path = require('path');

const bunyan = require('bunyan');
const electronSettings = require('electron-settings');
const { app } = require('electron');

const USER_DATA_PATH = app.getPath('userData');
const FILENAME = 'log';

// Get the directory for storing the app's configuration files.
// On macOS this defaults to `~/Library/Application Support/<APP_NAME>`.
const LOG_PATH = path.join(USER_DATA_PATH, FILENAME);

// The names of the OS information to get. https://nodejs.org/api/os.html
const SYSTEM_DETAILS = [
  'homedir',
  'hostname',
  'arch',
  'totalmem',
  'uptime',
  'freemem',
  'platform',
  'release',
  'type',
  'uptime',
  'cpus',
];

/**
 * Start a new bunyan logger instance.
 * @returns {object} bunyan Logger instance.
 */
function startLogger() {
  return bunyan.createLogger({
    name: electronSettings.get('name') || 'bigscreen',
    streams: [
      { level: 'fatal', path: LOG_PATH },
      { level: 'error', path: LOG_PATH },
      { level: 'warn', path: LOG_PATH },
      { level: 'info', path: LOG_PATH },
      { level: 'debug', path: LOG_PATH },
      { level: 'trace', path: LOG_PATH },
    ],
  });
}

/**
 * Get the system information specficied in SYSTEM_DETAILS.
 * @returns {object} osInfo Object of various OS information.
 */
function getSystemDetails() {
  // Make an object with the key as the os func name and result of
  // that function. E.g platform: darwin
  return exports.SYSTEM_DETAILS.reduce((info, detail) => {
    info[detail] = os[detail]();
    return info;
  }, {});
}

/**
 * Log generic system information.
 * @returns {void}
 */
function logSystemDetails() {
  const osInfo = exports.getSystemDetails();
  exports.log.debug({ osInfo });
}

module.exports = exports = {
  log: startLogger(),
  startLogger,
  logSystemDetails,
  getSystemDetails,
  SYSTEM_DETAILS,
};
