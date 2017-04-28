const os = require('os');
const path = require('path');

const bunyan = require('bunyan');
const { app } = require('electron');

const { settings } = require('../settings');

const USER_DATA_PATH = app.getPath('userData');
const FILENAME = 'log';

// Get the directory for storing the app's configuration files.
// On macOS this defaults to `~/Library/Application Support/<APP_NAME>`.
const LOG_PATH = path.join(USER_DATA_PATH, FILENAME);

const log = bunyan.createLogger({
  name: settings.get('name'),
  streams: [
    { level: 'fatal', path: LOG_PATH },
    { level: 'error', path: LOG_PATH },
    { level: 'warn', path: LOG_PATH },
    { level: 'info', path: LOG_PATH },
    { level: 'debug', path: LOG_PATH },
    { level: 'trace', path: LOG_PATH },
  ],
});

function logSystemDetails() {
  // OS information to get. Docs for each: https://nodejs.org/api/os.html
  const details = [
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

  const osInfo = details.reduce((info, detail) => {
    if (!info[detail]) {
      info[detail] = os[detail]();
    }

    return info;
  }, {});

  log.debug({ osInfo });
}

module.exports = {
  log,
  logSystemDetails,
};
