const { expect } = require('chai');
const fs = require('fs');
const mock = require('mock-fs');
const yaml = require('js-yaml');

const build = require('./build');

const defaultConfig = {
  app_name: 'Bigscreen',
  default_url: null,
  accent_color: '#000000',
};

const userConfig = {
  default_url: 'https://www.google.com/',
  accent_color: '#ffeead',
};

const defaultConfigFile = yaml.safeDump(defaultConfig);
const userConfigFile = yaml.safeDump(userConfig);
const brokenConfigFile = `
default_url = https://www.google.com/"
`;

describe('Build script', () => {
  beforeEach(() => {
    // Set up a fake file system structure for `fs` calls to play with.
    mock({
      // Fake a directory with some user config files.
      '/user/desktop': {
        'user_config.yaml': userConfigFile,
        'broken_user_config.yaml': brokenConfigFile,
        empty_directory: {},
      },

      // Fake the repo root directory.
      [__dirname]: {
        'config.yaml': defaultConfigFile,
      },

      // Fake the temporary path that electron-packager writes to when building.
      '/var/tmp/app': {
        'config.yaml': defaultConfigFile,
      },
    }, {
      createCwd: false,
    });
  });

  it('merge config files and writes them to desitnation', () => {
    const configA = '/user/desktop/user_config.yaml';
    const configB = `${__dirname}/config.yaml`;
    const destination = '/var/tmp/app/config.yaml';

    build.mergeConfigFiles(configA, configB, destination);

    const expectedFileOutput = yaml.safeDump(
      Object.assign(userConfig, defaultConfig)
    );

    const mergedFile = fs.readFileSync(destination, 'utf8');

    expect(mergedFile).to.be.equal(expectedFileOutput);
  });

  afterEach(() => {
    mock.restore();
  });
});
