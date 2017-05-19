const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const electronSettings = require('electron-settings');

describe('Sleep blocker', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('enableSleepBlocking', () => {
    it('calls blocker start and sets electron-setting to true', () => {
      const startStub = sandbox.stub();
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const sleepBlockerProxy = proxyquire('./', {
        electron: {
          powerSaveBlocker: {
            start: startStub,
          },
        },
      });

      sleepBlockerProxy.enableSleepBlocking();

      expect(startStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.calledOnce).to.equal(true);

      expect(startStub.args[0][0]).to.equal('prevent-display-sleep');
      expect(electronSettingsSetStub.args[0]).to.eql([
        'sleep_blocking',
        true,
      ]);
    });
  });

  describe('disableSleepBlocking', () => {
    it('calls blocker stop and sets electron-setting to false', () => {
      const expectedID = 666;
      const stopStub = sandbox.stub();
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const sleepBlockerProxy = proxyquire('./', {
        electron: {
          powerSaveBlocker: {
            stop: stopStub,
          },
        },
      });
      const getIDStub = sandbox.stub(sleepBlockerProxy, 'getID');

      getIDStub.returns(expectedID);
      sleepBlockerProxy.disableSleepBlocking();

      expect(stopStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.calledOnce).to.equal(true);

      expect(stopStub.args[0][0]).to.equal(expectedID);
      expect(electronSettingsSetStub.args[0]).to.eql([
        'sleep_blocking',
        false,
      ]);
    });

    it('does not call stop if there is no ID', () => {
      const stopStub = sandbox.stub();
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const sleepBlockerProxy = proxyquire('./', {
        electron: {
          powerSaveBlocker: {
            stop: stopStub,
          },
        },
      });

      sleepBlockerProxy.disableSleepBlocking();

      expect(stopStub.callCount).to.equal(0);
      expect(electronSettingsSetStub.callCount).to.equal(0);
    });
  });
});
