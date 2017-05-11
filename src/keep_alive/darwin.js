const fs = require('fs');
const path = require('path');

const plist = require('plist');
const electronSettings = require('electron-settings');

const {
  EXE_PATH,
  LAUNCH_AGENTS_PATH,
} = require('../settings/paths');

const LABEL = electronSettings.get('name') || 'Bigscreen';
const PLIST_PATH = path.join(LAUNCH_AGENTS_PATH, `${LABEL}.keepalive.plist`);

const PLIST_FILE = {
  label: LABEL,
  ProgramArguments: [EXE_PATH],
  NSQuitAlwaysKeepsWindows: false,
  KeepAlive: { SuccessfulExit: false },
};

/**
 * Create a directory called LaunchAgents in ~/Application Support.
 * @return {promise} Resolves if the directory is created successfully.
 */
function createLaunchAgentsDir() {
  return new Promise((resolve, reject) => {
    fs.mkdir(LAUNCH_AGENTS_PATH, (err) => {
      if (err) {
        return reject();
      }

      return resolve();
    });
  });
}

/**
 * Check if ~/Application Support/LaunchAgents exists. If it does not, create
 * the directory.
 * @return {promise} Resolves if either the directory is created or it exists.
 */
function ensureLaunchAgentsDirExists() {
  return new Promise((resolve, reject) => {
    const canWrite = fs.constants.W_OK;

    fs.access(LAUNCH_AGENTS_PATH, canWrite, (err) => {
      if (err && err.code === 'ENOENT') {
        return module.exports.createLaunchAgentsDir()
          .then(resolve).catch(reject);
      }

      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

/**
 * Create the `.plist` file to ensure the application restarts if
 * exits unsuccessfully.
 * @return {promise} Resolves if the `.plist` file is created.
 */
function enableKeepAlive() {
  const file = plist.build(PLIST_FILE);

  return new Promise((resolve, reject) => {
    module.exports.ensureLaunchAgentsDirExists().then(() => {
      fs.writeFile(PLIST_PATH, file, (err) => {
        if (err) {
          return reject(err);
        }

        return resolve();
      });
    }).catch(reject);
  });
}

/**
 * Remove the `.plist` file so that the application does not restart.
 * @return {promise} Resolves if the `.plist` has been removed.
 */
function disableKeepAlive() {
  return new Promise((resolve, reject) => {
    fs.unlink(PLIST_PATH, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

module.exports = {
  createLaunchAgentsDir,
  ensureLaunchAgentsDirExists,
  enableKeepAlive,
  disableKeepAlive,
};
