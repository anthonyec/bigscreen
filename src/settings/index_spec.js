const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const sinon = require('sinon');
const mock = require('mock-fs');
const yaml = require('js-yaml');
const { app } = require('electron')

const settings = require('./');

const defaultConfig = {
  app_name: 'Bigscreen',
  default_url: null,
  accent_color: '#000000',
};

const defaultConfigFile = yaml.safeDump(defaultConfig);

describe('Settings', () => {
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();

    // Set up a fake file system structure for `fs` calls to play with.
    mock({
      // Fake the repo root directory.
      [__dirname]: {
        'config.yaml': defaultConfigFile,
      },
      '/var/tmp/bigscreen': {
        'Settings': '',
      },
    }, {

      // Disable mock-fs creating a clone of then root dir, otherwise will get
      // an error that it already exists when creating [__dirname] above.
      createCwd: false,
    });
  });

  it('check if the settings already exist or not', () => {
    const electronSettingsStub = sandbox.stub(settings.settings, 'getAll');

    // Return an empty object.
    electronSettingsStub.callsFake(() => ({}));

    const noSettings = settings.hasSettings();
    expect(noSettings).to.be.false;

    // Returns an object with some keys and values inside.
    electronSettingsStub.callsFake(() => {
      return { name: 'test', color: 'red' };
    });

    const hasSettings = settings.hasSettings();
    expect(hasSettings).to.be.true;
  });

  it('returns the parsed configuration from config.yaml', () => {
    const getAppPathStub = sandbox.stub(settings.app, 'getAppPath');

    getAppPathStub.callsFake(() => __dirname);

    settings.getConfig().then((config) => {
      expect(config).to.be.eql(defaultConfig);
    });

    getAppPathStub.callsFake(() => path.join(__dirname, 'incorrect_path'));

    settings.getConfig().then().catch((err) => {
      expect(err.code).to.be.equal('ENOENT');
    });
  });

  it('loads config.yaml into settings only if settings do not exist', () => {
    const hasSettingsStub = sandbox.stub(settings, 'hasSettings');
    const getConfigStub = sandbox.stub(settings, 'getConfig');
    const setAllSettingsWithStub = sandbox.stub(settings, 'setAllSettingsWith');

    getConfigStub.callsFake(() => {
      return new Promise((resolve) => {
        resolve(defaultConfig);
      });
    });

    hasSettingsStub.returns(false);

    settings.loadConfigIntoSettings().then(() => {
      expect(setAllSettingsWithStub).to.be.calledOnce;
      expect(setAllSettingsWithStub.args[0][0]).to.be.eql(defaultConfig);

      hasSettingsStub.returns(true);

      settings.loadConfigIntoSettings().then(() => {
        expect(setAllSettingsWithStub.calledTwice).to.be.false;
      });
    });
  });

  it('loads config.yaml into settings if env var ALWAYS_LOAD_CONFIG is set', () => {
    const hasSettingsStub = sandbox.stub(settings, 'hasSettings');
    const shouldAlwaysLoadConfigStub = sandbox.stub(
      settings,
      'shouldAlwaysLoadConfig');
    const getConfigStub = sandbox.stub(settings, 'getConfig');
    const setAllSettingsWithStub = sandbox.stub(settings, 'setAllSettingsWith');

    getConfigStub.callsFake(() => {
      return new Promise((resolve) => {
        resolve(defaultConfig);
      });
    });

    hasSettingsStub.returns(true);
    shouldAlwaysLoadConfigStub.returns(true);

    settings.loadConfigIntoSettings().then(() => {
      expect(setAllSettingsWithStub).to.be.calledOnce;
      expect(setAllSettingsWithStub.args[0][0]).to.be.eql(defaultConfig);

      shouldAlwaysLoadConfigStub.returns(false);

      settings.loadConfigIntoSettings().then(() => {
        expect(setAllSettingsWithStub.calledTwice).to.be.false;
      });
    });
  });

  afterEach(() => {
    mock.restore();
    sandbox.restore();
  });
});
