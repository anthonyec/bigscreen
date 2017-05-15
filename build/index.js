const fs = require('fs');
const path = require('path');

const packager = require('electron-packager');
const mergeDirs = require('merge-dirs').default;
const program = require('commander');
const yaml = require('js-yaml');

const CWD = process.cwd();
const DEFAULT_INPUT_PATH = path.join(CWD);
const DEFAULT_OUTPUT_PATH = path.join(CWD, 'dist');
const DEFAULT_CONFIG_PATH = path.join(CWD, 'config.yaml');
const DEFAULT_RESOURCES_PATH = path.join(CWD, 'resources');

const PROGRAM_OPTIONS = [
  {
    command: '-i, --in <path>',
    description: `set input path, defaults to ${DEFAULT_INPUT_PATH}`,
    defaultValue: DEFAULT_INPUT_PATH,
  },
  {
    command: '-o, --out <path>',
    description: `set output path, defaults to ${DEFAULT_OUTPUT_PATH}`,
    defaultValue: DEFAULT_OUTPUT_PATH,
  },
  {
    command: '-c, --config <path>',
    description: `set config path, defaults to ${DEFAULT_CONFIG_PATH}`,
    defaultValue: DEFAULT_CONFIG_PATH,
  },
  {
    command: '-r, --resources <path>',
    description: `set resources path, defaults to ${DEFAULT_RESOURCES_PATH}`,
    defaultValue: DEFAULT_RESOURCES_PATH,
  },
  {
    command: '-p, --platform <string>',
    description: `the target platform(s) to build for, defaults to ${process.platform}`, // eslint-disable-line
    defaultValue: process.platform,
  },
  {
    command: '-a, --arch <string>',
    description: `the architecture to build for, defaults to ${process.arch}`,
    defaultValue: process.arch,
  },
];

/**
 * Turn each option into a program option for commander to use.
 * @returns {void}
 */
function parseProgramOptions() {
  PROGRAM_OPTIONS.forEach((option) => {
    program.option(option.command, option.description, option.defaultValue);
  });

  program.parse(process.argv);
}

/**
 * Check if the config path provided option is not different from the default.
 * @returns {boolean} true when default config path is the same as the
 * program option.
 */
function isDefaultConfigPath() {
  return program.config === DEFAULT_CONFIG_PATH;
}

/**
 * Check if the config path provided option is not different from the default.
 * @returns {boolean} true when the default resources path is the same as the
 * program option.
 */
function isDefaultResourcesPath() {
  return program.resources === DEFAULT_RESOURCES_PATH;
}

/**
 * Turn the electron-packager afterCopy arguments array into an object.
 * http://tinyurl.com/memjc3j
 * @param {array} argsArray Arguments as an array,
 * @returns {object} Object with temp build path and packager callback.
 */
function getPackagerArguments(argsArray) {
  // Get the first buildPath arg. This is where electron-packager stores built
  // files temporally.
  const tempBuildPath = argsArray.shift();

  // Get the last callback function argument. Call this to continue the build.
  const callback = argsArray.pop();

  return {
    tempBuildPath,
    callback,
  };
}

/**
 * Merge two config.yaml files together and returned resulting object.
 * @param {string} configPathA Path of the first config file.
 * @param {string} configPathB Path of the second config file.
 * @return {object} Object of merged YAML config files.
 */
function getMergedConfigFiles(configPathA, configPathB) {
  const configA = yaml.safeLoad(fs.readFileSync(configPathA, 'utf8'));
  const configB = yaml.safeLoad(fs.readFileSync(configPathB, 'utf8'));

  return Object.assign(configA, configB);
}

/**
 * Merge two config.yaml files together and write to a file.
 * @param {string} configPathA Path of the first config file.
 * @param {string} configPathB Path of the second config file.
 * @param {string} destinationPath Path of output file.
 * @return {void}
 */
function mergeConfigFiles(configPathA, configPathB, destinationPath) {
  const config = getMergedConfigFiles(configPathA, configPathB);

  fs.writeFileSync(destinationPath, yaml.safeDump(config));
}

/**
 * Merge two directories and overwrite files/folders with same name.
 * @param {string} dirPathA Path of the first dir.
 * @param {string} dirPathB Path of the second dir.
 * @return {void}
 */
function mergeDirectories(dirPathA, dirPathB) {
  mergeDirs(dirPathA, dirPathB, 'overwrite');
}

/**
 * Update the default config.yaml file if the user provides one as an argument
 * and write it to a file.
 * @param {array} arguments Array of arguments from electron-packager.
 * @return {void}
 */
function updateConfigFile(...args) {
  const { tempBuildPath, callback } = getPackagerArguments(args);
  const packageConfigPath = path.join(tempBuildPath, 'config.yaml');

  if (!exports.isDefaultConfigPath()) {
    exports.mergeConfigFiles(
      DEFAULT_CONFIG_PATH,
      program.config,
      packageConfigPath
    );
  }

  callback();
}

/**
 * Update the default resources dir if the user provides one as an argument.
 * @param {array} arguments Array of arguments from electron-packager.
 * @return {void}
 */
function updateResourcesDirectory(...args) {
  const { tempBuildPath, callback } = getPackagerArguments(args);
  const packageResourcesPath = path.join(tempBuildPath, 'resources');

  if (!exports.isDefaultResourcesPath()) {
    exports.mergeDirectories(program.resources, packageResourcesPath);
  }

  callback();
}

/**
 * Run electron-packager via API http://tinyurl.com/mm2khtv.
 * @return {void}
 */
function build() {
  const config = getMergedConfigFiles(DEFAULT_CONFIG_PATH, program.config);

  return new Promise((resolve, reject) => {
    packager({
      name: config.app_name,

      // Directory for src files, this must include a package.json to be a valid
      // electron app. Out directory is where the packaged app will be placed.
      dir: program.in,
      out: program.out,

      // Override existing packages in the dist folder.
      overwrite: true,

      icon: path.join(program.resources, 'app_icon/app.icns'),
      platform: program.platform,
      arch: program.arch,
      ignore: [
        'renderer_process/node_modules',
      ],

      // afterCopy functions are done in order after the app files are moved
      // to a temporary directory.
      afterCopy: [
        updateConfigFile,
        updateResourcesDirectory,
      ],
    }, (err, appPaths) => {
      if (err) {
        return reject(err);
      }

      return resolve(appPaths);
    });
  });
}

module.exports.isDefaultConfigPath = isDefaultConfigPath;
module.exports.isDefaultResourcesPath = isDefaultResourcesPath;
module.exports.getPackagerArguments = getPackagerArguments;
module.exports.getMergedConfigFiles = getMergedConfigFiles;
module.exports.mergeConfigFiles = mergeConfigFiles;
module.exports.mergeDirectories = mergeDirectories;
module.exports.updateConfigFile = updateConfigFile;
module.exports.updateResourcesDirectory = updateResourcesDirectory;
module.exports.parseProgramOptions = parseProgramOptions;
module.exports.build = build;

