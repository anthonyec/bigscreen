const fs = require('fs');
const path = require('path');

const program = require('commander');
const packager = require('electron-packager');
const yaml = require('js-yaml');

const log = require('../log');

const DEFAULT_INPUT_PATH = path.join(__dirname);
const DEFAULT_OUTPUT_PATH = path.join(__dirname, 'dist');
const DEFAULT_CONFIG_PATH = path.join(__dirname, 'config.yaml');
const DEFAULT_RESOURCES_PATH = path.join(__dirname, 'resources');

const options = [
  {
    command: '-i, --in <path>',
    description: 'set input path, defaults to ./',
    defaultValue: DEFAULT_INPUT_PATH,
  },
  {
    command: '-o, --out <path>',
    description: 'set output path, defaults to ./dist',
    defaultValue: DEFAULT_OUTPUT_PATH,
  },
  {
    command: '-c, --config <path>',
    description: 'set config path, defaults to ./config.toml',
    defaultValue: DEFAULT_CONFIG_PATH,
  },
  {
    command: '-r, --resources <path>',
    description: 'set resources path, defaults to ./resources',
    defaultValue: DEFAULT_RESOURCES_PATH,
  },
];

function parseProgramOptions() {
  options.forEach((option) => {
    program.option(option.command, option.description, option.defaultValue);
  });

  program.parse(process.argv);
}

/**
 * Check if the config path provided option is not different from the default.
 * @returns {boolean} Is default config path different from program option.
 */
function isDefaultConfigPath() {
  return program.config === DEFAULT_CONFIG_PATH;
}

/**
 * Merge two config.yaml files together and write output to a file.
 * @param {string} configPathA Path of the first config file.
 * @param {string} configPathB Path of the second config file.
 * @param {string} destinationPath Where to write the merged output.
 * @return {undefined}
 */
function mergeConfigFiles(configPathA, configPathB, destinationPath) {
  const configA = yaml.safeLoad(fs.readFileSync(configPathA, 'utf8'));
  const configB = yaml.safeLoad(fs.readFileSync(configPathB, 'utf8'));
  const mergedConfig = Object.assign(configA, configB);

  fs.writeFileSync(destinationPath, yaml.safeDump(mergedConfig));
}

/**
 * Update the default config.yaml file if the user provides one as an argument.
 * buildPath, electronVersion, platform, arch, callback
 * http://tinyurl.com/memjc3j
 * @param {array} arguments Array of arguments from electron-packager:
 * @return {undefined}
 */
function updateConfigFile(...args) {
  // Get the first buildPath arg. This is where electron-packager stores built
  // files temporally.
  const tempBuildPath = args.shift();

  // Get the last callback function argument. Call this to continue the build.
  const callback = args.pop();
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

function build() {
  packager({
    dir: program.in,
    out: program.out,
    overwrite: true,
    afterCopy: [updateConfigFile],
  }, (err, appPaths) => {
    log.info('Build complete', appPaths);
  });
}

module.exports.isDefaultConfigPath = isDefaultConfigPath;
module.exports.mergeConfigFiles = mergeConfigFiles;
module.exports.updateConfigFile = updateConfigFile;
module.exports.parseProgramOptions = parseProgramOptions;
module.exports.build = build;

