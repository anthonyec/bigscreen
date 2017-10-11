const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const notificationsBlocker = require('./win32');

describe('Notificationss blocker for win32', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('booleanToInt', () => {
    it('returns 1 if true', () => {
      const value = notificationsBlocker.booleanToInt(true);
      expect(value).to.equal(1);
    });

    it('returns 0 if false', () => {
      const value = notificationsBlocker.booleanToInt(false);
      expect(value).to.equal(0);
    });
  });

  describe('isWindows7', () => {
    it('correctly detects when version is windows 7', () => {
      const callWithCorrectVersion1 = notificationsBlocker.isWindows7('6.1');
      const callWithCorrectVersion2 = notificationsBlocker.isWindows7('6.1.1');
      const callWithCorrectVersion3 = notificationsBlocker.isWindows7('6.0');

      expect(callWithCorrectVersion1).to.equal(true);
      expect(callWithCorrectVersion2).to.equal(true);
      expect(callWithCorrectVersion3).to.equal(false);
    });

    it('correctly detects when version is NOT windows 7', () => {
      const callWithWrongVersion1 = notificationsBlocker.isWindows7('6.2');
      const callWithWrongVersion2 = notificationsBlocker.isWindows7('6.6.1');
      const callWithWrongVersion3 = notificationsBlocker.isWindows7('10');
      const callWithWrongVersion4 = notificationsBlocker.isWindows7('10.1');

      expect(callWithWrongVersion1).to.equal(false);
      expect(callWithWrongVersion2).to.equal(false);
      expect(callWithWrongVersion3).to.equal(false);
      expect(callWithWrongVersion4).to.equal(false);
    });
  });

  describe('setPushNotificationsEntry', () => {
    it('calls winreg with correct arguments', (done) => {
      const expectArgs = {
        hive: 'HKCU',
        key: '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications', // eslint-disable-line
      };

      const setSpy = sandbox.spy((key, type, value, callback) => {
        callback();
      });

      const registrySpy = sandbox.spy(function Registry() {
        this.set = setSpy;
      });

      const notificationsBlockerProxy = proxyquire('./win32', {
        winreg: registrySpy,
      });

      notificationsBlockerProxy.setPushNotificationsEntry(true).then(() => {
        expect(registrySpy.args[0][0]).to.eql(expectArgs);

        expect(setSpy.args[0][0]).to.equal('ToastEnabled');
        expect(setSpy.args[0][1]).to.equal('REG_DWORD');

        // Expect `true` to get turned into `1`
        expect(setSpy.args[0][2]).to.equal(1);

        done();
      }).catch(done);
    });
  });

  describe('setBalloonTipsRegistryEntry', () => {
    it('calls winreg with correct arguments', (done) => {
      const expectArgs = {
        hive: 'HKCU',
        key: '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced', // eslint-disable-line
      };

      const setSpy = sandbox.spy((key, type, value, callback) => {
        callback();
      });

      const registrySpy = sandbox.spy(function Registry() {
        this.set = setSpy;
      });

      const notificationsBlockerProxy = proxyquire('./win32', {
        winreg: registrySpy,
      });

      notificationsBlockerProxy.setBalloonTipsRegistryEntry(true).then(() => {
        expect(registrySpy.args[0][0]).to.eql(expectArgs);

        expect(setSpy.args[0][0]).to.equal('EnableBalloonTips');
        expect(setSpy.args[0][1]).to.equal('REG_DWORD');

        // Expect `true` to get turned into `1`
        expect(setSpy.args[0][2]).to.equal(1);

        done();
      }).catch(done);
    });
  });

  describe('toggleBalloonTips', () => {
    it('sets balloon tips and restarts windows explorer', () => {
      const setBalloonTipsRegistryEntryStub = sandbox.stub();

      notificationsBlocker.setBalloonTipsRegistryEntry =
        setBalloonTipsRegistryEntryStub;

      setBalloonTipsRegistryEntryStub.returns(Promise.resolve());

      return notificationsBlocker.toggleBalloonTips(true).then(() => {
        expect(setBalloonTipsRegistryEntryStub.args[0][0]).to.equal(true);
        expect(setBalloonTipsRegistryEntryStub.calledOnce).to.equal(true);
      });
    });
  });

  describe('toggleToastNotifications', () => {
    it('sets push notifications and restarts windows explorer', () => {
      const setPushNotificationsEntryStub = sandbox.stub();

      notificationsBlocker.setPushNotificationsEntry =
        setPushNotificationsEntryStub;

      setPushNotificationsEntryStub.returns(Promise.resolve());

      return notificationsBlocker.toggleToastNotifications(true).then(() => {
        expect(setPushNotificationsEntryStub.args[0][0]).to.equal(true);
        expect(setPushNotificationsEntryStub.calledOnce).to.equal(true);
      });
    });
  });

  describe('enableNotificationBlocker', () => {
    it('if windows 7 calls toggleBalloonTips set to false', () => {
      const isWindows7Stub = sandbox.stub();
      const toggleBalloonTipsStub = sandbox.stub();
      const toggleToastNotificationsStub = sandbox.stub();

      notificationsBlocker.isWindows7 = isWindows7Stub;
      notificationsBlocker.toggleBalloonTips = toggleBalloonTipsStub;
      notificationsBlocker.toggleToastNotifications =
        toggleToastNotificationsStub;

      isWindows7Stub.returns(true);
      notificationsBlocker.enableNotificationBlocker();

      expect(isWindows7Stub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.args[0][0]).to.equal(false);
    });

    it('if not windows 7 calls toggleToastNotification set to false', () => {
      const isWindows7Stub = sandbox.stub();
      const toggleBalloonTipsStub = sandbox.stub();
      const toggleToastNotificationsStub = sandbox.stub();

      notificationsBlocker.isWindows7 = isWindows7Stub;
      notificationsBlocker.toggleBalloonTips = toggleBalloonTipsStub;
      notificationsBlocker.toggleToastNotifications =
        toggleToastNotificationsStub;

      isWindows7Stub.returns(false);
      notificationsBlocker.enableNotificationBlocker();

      expect(isWindows7Stub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.calledOnce).to.equal(false);
      expect(toggleToastNotificationsStub.calledOnce).to.equal(true);
      expect(toggleToastNotificationsStub.args[0][0]).to.equal(false);
    });
  });

  describe('disableNotificationBlocker', () => {
    it('if windows 7 calls toggleBalloonTips set to true', () => {
      const isWindows7Stub = sandbox.stub();
      const toggleBalloonTipsStub = sandbox.stub();
      const toggleToastNotificationsStub = sandbox.stub();

      notificationsBlocker.isWindows7 = isWindows7Stub;
      notificationsBlocker.toggleBalloonTips = toggleBalloonTipsStub;
      notificationsBlocker.toggleToastNotifications =
        toggleToastNotificationsStub;

      isWindows7Stub.returns(true);
      notificationsBlocker.disableNotificationBlocker();

      expect(isWindows7Stub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.args[0][0]).to.equal(true);
    });

    it('if not windows 7 calls toggleToastNotification set to true', () => {
      const isWindows7Stub = sandbox.stub();
      const toggleBalloonTipsStub = sandbox.stub();
      const toggleToastNotificationsStub = sandbox.stub();

      notificationsBlocker.isWindows7 = isWindows7Stub;
      notificationsBlocker.toggleBalloonTips = toggleBalloonTipsStub;
      notificationsBlocker.toggleToastNotifications =
        toggleToastNotificationsStub;

      isWindows7Stub.returns(false);
      notificationsBlocker.disableNotificationBlocker();

      expect(isWindows7Stub.calledOnce).to.equal(true);
      expect(toggleBalloonTipsStub.calledOnce).to.equal(false);
      expect(toggleToastNotificationsStub.calledOnce).to.equal(true);
      expect(toggleToastNotificationsStub.args[0][0]).to.equal(true);
    });
  });
});
