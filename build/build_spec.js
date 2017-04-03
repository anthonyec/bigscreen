const { expect } = require('chai');
const sinon = require('sinon');
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
      // Disable mock-fs creating a clone of then root dir, otherwise will get
      // an error that it already exists when creating [__dirname] above.
      createCwd: false,
    });
  });

  it('parses array of arguments into an object from electron-packager', () => {
    const options = build.getPackagerArguments([
      'path',
      () => {},
    ]);

    expect(options.tempBuildPath).to.be.equal('path');
    expect(options.callback).to.be.an('function');
  });

  it('merge config files and writes them to desitnation', () => {
    const configA = '/user/desktop/user_config.yaml';
    const configB = `${__dirname}/config.yaml`;
    const destination = '/var/tmp/app/config.yaml';

    build.mergeConfigFiles(configA, configB, destination);

    const mergedFile = fs.readFileSync(destination, 'utf8');
    const expectedFileOutput = yaml.safeDump(
      Object.assign(userConfig, defaultConfig)
    );

    expect(mergedFile).to.be.equal(expectedFileOutput);
  });

  it('only merges configs when the provided path is different from the default', () => { // eslint-disable-line
    const isDefaultConfigPathStub = sinon.stub(build, 'isDefaultConfigPath');
    const mergeConfigFilesSpy = sinon.stub(build, 'mergeConfigFiles');
    const callbackSpy = sinon.spy();

    // Simulate the config path being the same as the default.
    isDefaultConfigPathStub.returns(true);
    build.updateConfigFile('/var/tmp/app', callbackSpy);
    expect(mergeConfigFilesSpy).to.be.notCalled; // eslint-disable-line
    expect(callbackSpy).to.be.calledOnce; // eslint-disable-line

    // Simulate the config path NOT being the same as the default.
    isDefaultConfigPathStub.returns(false);
    build.updateConfigFile('/var/tmp/app', callbackSpy);
    expect(mergeConfigFilesSpy).to.be.calledOnce; // eslint-disable-line
    expect(callbackSpy).to.be.calledTwice; // eslint-disable-line
  });

  afterEach(() => {
    mock.restore();
  });
});
