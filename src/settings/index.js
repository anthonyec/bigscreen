const fs = require('fs');
const path = require('path');

const { app } = require('electron');
const yaml = require('js-yaml');
const electronSettings = require('electron-settings');

/**
 * Get the path of the config.yaml file. It's in a own function so it can be
 * mocked in tests.
 * @returns {string} Path of the config.yaml file.
 */
function getConfigPath() {
  return path.join(app.getAppPath(), 'config.yaml');
}

/**
 * Check if any settings have been set.
 * @returns {boolean} true if settings object contain more than 0 keys.
 */
function hasSettings() {
  return Object.keys(electronSettings.getAll()).length > 0;
}

/**
 * Returns boolean if the config should always be loaded to assist development.
 * @returns {boolean} true if config should always be loaded into settings.
 */
function shouldAlwaysLoadConfig() {
  return process.env.ALWAYS_LOAD_CONFIG;
}

/**
 * Get and parse the settings stored in ./config.yaml.
 * @returns {promise} Object of config data.
 */
function getConfig() {
  const configPath = exports.getConfigPath();

  return new Promise((resolve, reject) => {
    fs.readFile(configPath, 'utf8', (err, data) => {
      if (err) {
        return reject(err);
      }

      const config = yaml.safeLoad(data);
      return resolve(config);
    });
  });
}

/**
 * Use object as all the settings. Essentially wiping existing ones.
 * @param {object} config Object with config settings.
 * @returns {void}
 */
function setAllSettingsWith(config) {
  electronSettings.setAll(config);
}

/**
 * Get and parse and stored in ./config.yaml and save them settings ONLY if
 * no settings exist already or if the env variable ALWAYS_LOAD_CONFIG is set.
 * @returns {promise} Promise of getConfig.
 */
function loadConfigIntoSettings() {
  return exports.getConfig().then((config) => {
    if (!exports.hasSettings() || exports.shouldAlwaysLoadConfig()) {
      exports.setAllSettingsWith(config);
    }
  });
}

module.exports.hasSettings = hasSettings;
module.exports.getConfig = getConfig;
module.exports.shouldAlwaysLoadConfig = shouldAlwaysLoadConfig;
module.exports.loadConfigIntoSettings = loadConfigIntoSettings;
module.exports.setAllSettingsWith = setAllSettingsWith;
module.exports.getConfigPath = getConfigPath;
module.exports.electronSettings = electronSettings;
