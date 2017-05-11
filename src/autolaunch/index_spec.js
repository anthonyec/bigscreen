const AutoLaunch = require('auto-launch');
const { expect } = require('chai');
const sinon = require('sinon');
const electronSettings = require('electron-settings');
const proxyquire = require('proxyquire');

const autolaunch = require('./');
const { log } = require('../log');

describe('Autolaunch', () => {
  let sandbox;
  let electronSettingsGetStub;
  let electronSettingsSetStub;
  let logInfoStub;
  let logErrorStub;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();

    electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
    electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
    logInfoStub = sandbox.stub(log, 'info');
    logErrorStub = sandbox.stub(log, 'error');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('enables electron setting and logs error', () => {
    const stubbedAutoLaunch = sandbox.stub(AutoLaunch.prototype, 'enable');
    const autoLaunchProxy = proxyquire('./', {
      'auto-launch': AutoLaunch,
    });

    stubbedAutoLaunch.returns(Promise.resolve());

    autoLaunchProxy.enableAutoLaunch().then(() => {
      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql(['autolaunch', true]);

      expect(logInfoStub.calledOnce).to.equal(true);
      expect(logInfoStub.args[0]).to.eql(['autolaunch enabled']);
    }).catch((err) => {
      console.error(err);
    });
  });

  it('failing to enable autolaunch throws error and logs it', () => {
    const stubbedAutoLaunch = sandbox.stub(AutoLaunch.prototype, 'enable');
    const autoLaunchProxy = proxyquire('./', {
      'auto-launch': AutoLaunch,
    });

    stubbedAutoLaunch.returns(Promise.reject());

    autoLaunchProxy.enableAutoLaunch().catch((err) => {
      expect(logErrorStub.calledOnce).to.equal(true);
      expect(logErrorStub.args[0][0]).to.eql('failed to enable auto launch');
      expect(err).to.exist; // eslint-disable-line
    });
  });

  it('disables electron setting', () => {
    const stubbedAutoLaunch = sandbox.stub(AutoLaunch.prototype, 'disable');
    const autoLaunchProxy = proxyquire('./', {
      'auto-launch': AutoLaunch,
    });

    stubbedAutoLaunch.returns(Promise.resolve());

    autoLaunchProxy.disableAutoLaunch().then(() => {
      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql(['autolaunch', false]);

      expect(logInfoStub.calledOnce).to.equal(true);
      expect(logInfoStub.args[0]).to.eql(['autolaunch disabled']);
    }).catch((err) => {
      console.error(err);
    });
  });

  it('failing to disable autolaunch throws error and logs it', () => {
    const stubbedAutoLaunch = sandbox.stub(AutoLaunch.prototype, 'disable');
    const autoLaunchProxy = proxyquire('./', {
      'auto-launch': AutoLaunch,
    });

    stubbedAutoLaunch.returns(Promise.reject());

    autoLaunchProxy.disableAutoLaunch().catch((err) => {
      expect(logErrorStub.calledOnce).to.equal(true);
      expect(logErrorStub.args[0][0]).to.eql('failed to disabled auto launch');
      expect(err).to.exist; // eslint-disable-line
    });
  });

  it('retrived electron setting value', () => {
    let result;

    electronSettingsGetStub.returns(true);
    result = autolaunch.isAutoLaunchEnabled();

    expect(result).to.equal(true);
    expect(electronSettingsGetStub.args[0][0]).to.equal('autolaunch');

    electronSettingsGetStub.returns(false);
    result = autolaunch.isAutoLaunchEnabled();

    expect(result).to.equal(false);
  });
});
