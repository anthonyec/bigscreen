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

  describe('getAutoLaunchInstance', () => {
    it('creates AutoLaunch instance and caches it', () => {
      const expectedArgs = {
        name: 'bigscreen',
        mac: { useLaunchAgent: true },
      };

      // http://stackoverflow.com/a/33383157
      const AutoLaunchSpyWrapper = sandbox.spy(function() { // eslint-disable-line
        return sinon.createStubInstance(AutoLaunch);
      });
      const isReadyStub = sandbox.stub();
      const autoLaunchProxy = proxyquire('./', {
        'auto-launch': AutoLaunchSpyWrapper,
        electron: {
          app: {
            isReady: isReadyStub,
            getPath: () => '/users/',
          },
        },
      });

      isReadyStub.returns(true);

      const returnedFunction = autoLaunchProxy.getAutoLaunchInstance();
      const firstReturnedValue = returnedFunction();

      // Call second time to ensure AutoLaunch is cached.
      const secondReturnedValue = returnedFunction();

      expect(isReadyStub.calledTwice).to.equal(true);
      expect(AutoLaunchSpyWrapper.calledOnce).to.equal(true);
      expect(AutoLaunchSpyWrapper.args[0][0]).to.eql(expectedArgs);

      expect(firstReturnedValue).to.equal(secondReturnedValue);
    });

    it('throws error if app is not ready', () => {
      const isReadyStub = sandbox.stub();
      const autoLaunchProxy = proxyquire('./', {
        electron: {
          app: {
            isReady: isReadyStub,
            getPath: () => '/users/',
          },
        },
      });

      isReadyStub.returns(false);

      const returnedFunction = autoLaunchProxy.getAutoLaunchInstance();
      const expectedError = `Can't use autoLaunch before the app is ready.`; // eslint-disable-line

      // This does not use a try/catch because If returnedFunction does not
      // throw, it will never end up in the catch. So the function call is
      // wrapped in a method instead.
      const call = () => returnedFunction();

      expect(call).to.throw(expectedError);
      expect(isReadyStub.calledOnce).to.equal(true);
    });
  });

  describe('enableAutoLaunch', () => {
    it('sets electron-setting and logs a info message', () => {
      const getAutoLaunchInstanceStub = sandbox.stub(
        autolaunch,
        'getAutoLaunchInstance'
      );
      const enableStub = sandbox.stub();

      // Return object with enable function to replicate AutoLAunch API.
      getAutoLaunchInstanceStub.returns(() => ({ enable: enableStub }));

      // Pretend AutoLaunch successfully enabled start at login.
      enableStub.returns(Promise.resolve());

      return autolaunch.enableAutoLaunch().then(() => {
        // Check that getAutoLaunchInstance is created.
        expect(getAutoLaunchInstanceStub.calledOnce).to.equal(true);

        // Check settings are getting retrived.
        expect(electronSettingsSetStub.calledOnce).to.equal(true);
        expect(electronSettingsSetStub.args[0]).to.eql(['autolaunch', true]);

        // Check it logs.
        expect(logInfoStub.calledOnce).to.equal(true);
        expect(logInfoStub.args[0]).to.eql(['autolaunch enabled']);
      });
    });

    it('failing to enable autolaunch throws error and logs it', () => {
      const getAutoLaunchInstanceStub = sandbox.stub(
        autolaunch,
        'getAutoLaunchInstance'
      );
      const enableStub = sandbox.stub();

      // Return object with enable function to replicate AutoLAunch API.
      getAutoLaunchInstanceStub.returns(() => ({ enable: enableStub }));

      // Pretend AutoLaunch successfully enabled start at login.
      enableStub.returns(Promise.reject());

      return autolaunch.enableAutoLaunch().catch(() => {
        // Check that getAutoLaunchInstance is created.
        expect(getAutoLaunchInstanceStub.calledOnce).to.equal(true);

        // Check it logs error.
        expect(logErrorStub.calledOnce).to.equal(true);
        expect(logErrorStub.args[0]).to.eql([
          'failed to enable auto launch',
          undefined,
        ]);
      });
    });
  });

  describe('disableAutoLaunch', () => {
    it('sets electron-setting and logs a info message', () => {
      const getAutoLaunchInstanceStub = sandbox.stub(
        autolaunch,
        'getAutoLaunchInstance'
      );
      const disableStub = sandbox.stub();

      // Return object with enable function to replicate AutoLAunch API.
      getAutoLaunchInstanceStub.returns(() => ({ disable: disableStub }));

      // Pretend AutoLaunch successfully enabled start at login.
      disableStub.returns(Promise.resolve());

      return autolaunch.disableAutoLaunch().then(() => {
        // Check that getAutoLaunchInstance is created.
        expect(getAutoLaunchInstanceStub.calledOnce).to.equal(true);

        // Check settings are getting retrieved.
        expect(electronSettingsSetStub.calledOnce).to.equal(true);
        expect(electronSettingsSetStub.args[0]).to.eql(['autolaunch', false]);

        // Check it logs.
        expect(logInfoStub.calledOnce).to.equal(true);
        expect(logInfoStub.args[0]).to.eql(['autolaunch disabled']);
      });
    });

    it('failing to disable autolaunch throws error and logs it', () => {
      const getAutoLaunchInstanceStub = sandbox.stub(
        autolaunch,
        'getAutoLaunchInstance'
      );
      const disableStub = sandbox.stub();

      // Return object with enable function to replicate AutoLAunch API.
      getAutoLaunchInstanceStub.returns(() => ({ disable: disableStub }));

      // Pretend AutoLaunch successfully enabled start at login.
      disableStub.returns(Promise.reject());

      return autolaunch.disableAutoLaunch().catch(() => {
        // Check that getAutoLaunchInstance is created.
        expect(getAutoLaunchInstanceStub.calledOnce).to.equal(true);

        // Check it logs error.
        expect(logErrorStub.calledOnce).to.equal(true);
        expect(logErrorStub.args[0]).to.eql([
          'failed to disabled auto launch',
          undefined,
        ]);
      });
    });
  });

  describe('isAutoLaunchEnabled', () => {
    it('retrieve electron-setting value', () => {
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
});
