const fs = require('fs');
const path = require('path');
const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-fs');
const yaml = require('js-yaml');

const build = require('./');

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
!default_url = "broke"
`;

describe('Build script', () => {
  beforeEach(() => {
    // Set up a fake file system structure for `fs` calls to play with.
    mock({
      // Fake a directory with some user config files.
      '/user/desktop': {
        'user_config.yaml': userConfigFile,
        'broken_user_config.yaml': brokenConfigFile,
        user_resources: {
          file_c: 'file_c',
          file_d: 'file_d',
          file_x: 'file_x',
        },
      },

      // Fake the repo root directory.
      [__dirname]: {
        'config.yaml': defaultConfigFile,
        resources: {
          file_a: 'file_a',
          file_b: 'file_b',
          file_x: '',
        },
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

    expect(options).to.have.all.keys('tempBuildPath', 'callback');
    expect(options.tempBuildPath).to.be.equal('path');
    expect(options.callback).to.be.an('function');
  });

  it('merge config files and writes them to desitnation', () => {
    const configA = '/user/desktop/user_config.yaml';
    const configB = path.join(__dirname, 'config.yaml');
    const destination = '/var/tmp/app/config.yaml';

    build.mergeConfigFiles(configA, configB, destination);

    const mergedFile = fs.readFileSync(destination, 'utf8');
    const expectedFileOutput = yaml.safeDump(
      Object.assign(userConfig, defaultConfig)
    );

    expect(mergedFile).to.be.equal(expectedFileOutput);
  });

  it('merge config files and return object', () => {
    const configA = '/user/desktop/user_config.yaml';
    const configB = path.join(__dirname, 'config.yaml');

    const mergedConfig = build.getMergedConfigFiles(configA, configB);
    const expectedOutput = Object.assign(userConfig, defaultConfig);

    expect(mergedConfig).to.be.eql(expectedOutput);
  });

  it('handles incorrect user config path', () => {
    const configA = '/user/desktop/does_not_exist.yaml';
    const configB = path.join(__dirname, 'config.yaml');
    const destination = '/var/tmp/app/config.yaml';

    try {
      build.mergeConfigFiles(configA, configB, destination);
    } catch (err) {
      expect(err.code).to.be.equal('ENOENT');
    }

    // Make sure that no file is written
    const mergedFile = fs.readFileSync(destination, 'utf8');
    const expectedFileOutput = yaml.safeDump(defaultConfig);

    expect(mergedFile).to.be.equal(expectedFileOutput);
  });

  it('merge resource directories', () => {
    const resourcesA = '/user/desktop/user_resources';
    const resourcesB = path.join(__dirname, 'resources');

    build.mergeDirectories(resourcesA, resourcesB);

    const mergedDir = fs.readdirSync(resourcesB);
    const fileXContent = fs.readFileSync(
      path.join(resourcesB, 'file_x'),
      'utf8'
    );

    expect(mergedDir).to.be.eql([
      'file_a',
      'file_b',
      'file_c',
      'file_d',
      'file_x',
    ]);

    expect(fileXContent).to.be.equal(fileXContent);
  });

  it('handles incorrect resource path', () => {
    const resourcesA = '/user/desktop/does_not_exist';
    const resourcesB = path.join(__dirname, 'resources');

    try {
      build.mergeDirectories(resourcesA, resourcesB);
    } catch (err) {
      expect(err.code).to.be.equal('ENOENT');
    }

    // Make sure the file system is unchanged after the error
    const mergedDir = fs.readdirSync(resourcesB);
    const fileXContent = fs.readFileSync(
      path.join(resourcesB, 'file_x'),
      'utf8'
    );

    expect(mergedDir).to.be.eql([
      'file_a',
      'file_b',
      'file_x',
    ]);

    expect(fileXContent).to.be.equal('');
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

  it('only merges resources when the provided path is different from the default', () => { // eslint-disable-line
    const isDefaultResourcesPathStub = sinon.stub(
      build,
      'isDefaultResourcesPath'
    );
    const mergeDirectoriesSpy = sinon.stub(build, 'mergeDirectories');
    const callbackSpy = sinon.spy();

    // Simulate the resources path being the same as the default.
    isDefaultResourcesPathStub.returns(true);
    build.updateResourcesDirectory('/var/tmp/app', callbackSpy);
    expect(mergeDirectoriesSpy).to.be.notCalled; // eslint-disable-line
    expect(callbackSpy).to.be.calledOnce; // eslint-disable-line

    // Simulate the resources path NOT being the same as the default.
    isDefaultResourcesPathStub.returns(false);
    build.updateResourcesDirectory('/var/tmp/app', callbackSpy);
    expect(mergeDirectoriesSpy).to.be.calledOnce; // eslint-disable-line
    expect(callbackSpy).to.be.calledTwice; // eslint-disable-line
  });

  afterEach(() => {
    mock.restore();
  });
});
