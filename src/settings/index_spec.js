const path = require('path');

const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-fs');
const yaml = require('js-yaml');

const settings = require('./');

const defaultConfig = {
  app_name: 'Bigscreen',
  default_url: null,
  accent_color: '#000000',
};
const defaultConfigFile = yaml.safeDump(defaultConfig);
const configPath = path.join(__dirname, 'config.yaml');

describe('Settings', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();

    // Set up a fake file system structure for `fs` calls to play with.
    mock({
      // Fake the repo root directory.
      [__dirname]: {
        'config.yaml': defaultConfigFile,
      },
      '/var/tmp/bigscreen': {
        Settings: '',
      },
    }, {

      // Disable mock-fs creating a clone of then root dir, otherwise will get
      // an error that it already exists when creating [__dirname] above.
      createCwd: false,
    });
  });

  it('check if the settings already exist or not', () => {
    const getAllStub = sandbox.stub(settings.electronSettings, 'getAll');
    const getConfigPathStub = sandbox.stub(settings, 'getConfigPath');

    // Returns correct config path.
    getConfigPathStub.returns(configPath);

    // Return an empty object.
    getAllStub.callsFake(() => ({}));

    const noSettings = settings.hasSettings();
    expect(noSettings).to.be.false; // eslint-disable-line

    // Run test again but this time returns an object with some
    // keys and values inside to simulate settings existing.
    getAllStub.callsFake(() => {
      return { name: 'test', color: 'red' };
    });

    const hasSettings = settings.hasSettings();
    expect(hasSettings).to.be.true; // eslint-disable-line
  });

  it('returns the parsed configuration from config.yaml', () => {
    const getConfigPathStub = sandbox.stub(settings, 'getConfigPath');

    // Returns correct config path.
    getConfigPathStub.returns(configPath);

    // Make sure getConfig loads defaultConfig data.
    settings.getConfig().then((config) => {
      expect(config).to.be.eql(defaultConfig);
    });

    // Now change getConfigPath to return a non-exist path.
    getConfigPathStub.returns(__dirname, 'incorrect_path');

    // Make sure it throws an error.
    settings.getConfig().then().catch((err) => {
      expect(err.code).to.be.equal('EBADF');
    });
  });

  it('loads config.yaml into settings only if settings do not exist', () => {
    const hasSettingsStub = sandbox.stub(settings, 'hasSettings');
    const getConfigStub = sandbox.stub(settings, 'getConfig');
    const setAllSettingsWithStub = sandbox.stub(settings, 'setAllSettingsWith');

    // Stub getConfig to return a defaultConfig object.
    getConfigStub.callsFake(() => {
      return new Promise((resolve) => {
        resolve(defaultConfig);
      });
    });

    // Simulate no settings being set.
    hasSettingsStub.returns(false);

    // Test the loadConfigIntoSettings.
    settings.loadConfigIntoSettings().then(() => {
      // Because no settings have been set we want to make sure setAll is called
      // once with the correct settings.
      expect(setAllSettingsWithStub).to.be.calledOnce; // eslint-disable-line
      expect(setAllSettingsWithStub.args[0][0]).to.be.eql(defaultConfig);

      // Simulate the settings being set.
      hasSettingsStub.returns(true);

      // Now the loadConfigIntoSettings should **not** load
      // config into settings. If it did, it would call the setAll twice.
      settings.loadConfigIntoSettings().then(() => {
        expect(setAllSettingsWithStub.calledTwice).to.be.false; // eslint-disable-line
      });
    });
  });

  it('loads config.yaml into settings if env var ALWAYS_LOAD_CONFIG is set', () => { // eslint-disable-line
    const hasSettingsStub = sandbox.stub(settings, 'hasSettings');
    const shouldAlwaysLoadConfigStub = sandbox.stub(
      settings,
      'shouldAlwaysLoadConfig');
    const getConfigStub = sandbox.stub(settings, 'getConfig');
    const setAllSettingsWithStub = sandbox.stub(settings, 'setAllSettingsWith');

    // Stub getConfig to return a defaultConfig object.
    getConfigStub.callsFake(() => {
      return new Promise((resolve) => {
        resolve(defaultConfig);
      });
    });

    // Simulate setting being set all already **but** with the override boolean
    // of always loading settings. This would be via
    // the env var ALWAYS_LOAD_CONFIG.
    hasSettingsStub.returns(true);
    shouldAlwaysLoadConfigStub.returns(true);

    settings.loadConfigIntoSettings().then(() => {
      expect(setAllSettingsWithStub).to.be.calledOnce; // eslint-disable-line
      expect(setAllSettingsWithStub.args[0][0]).to.be.eql(defaultConfig);

      shouldAlwaysLoadConfigStub.returns(false);

      settings.loadConfigIntoSettings().then(() => {
        expect(setAllSettingsWithStub.calledTwice).to.be.false; // eslint-disable-line
      });
    });
  });

  afterEach(() => {
    mock.restore();
    sandbox.restore();
  });
});
