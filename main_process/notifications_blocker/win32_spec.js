const { expect } = require('chai');
const sinon = require('sinon');

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

  describe('getBalloonEntryValue', () => {
    it('returns correct options for regedit', () => {
      const valueFalse = notificationsBlocker.getBalloonEntryValue(0);
      const valueTrue = notificationsBlocker.getBalloonEntryValue(1);

      const expectedValueFalse = {
        ['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced']: { // eslint-disable-line
          EnableBalloonTips: {
            value: 0,
            type: 'REG_DWORD',
          },
        },
      };

      const expectedValueTrue = {
        ['HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced']: { // eslint-disable-line
          EnableBalloonTips: {
            value: 1,
            type: 'REG_DWORD',
          },
        },
      };

      expect(valueFalse).to.eql(expectedValueFalse);
      expect(valueTrue).to.eql(expectedValueTrue);
    });
  });

  describe('getPushNotificationsValue', () => {
    it('returns correct options for regedit', () => {
      const valueFalse = notificationsBlocker.getPushNotificationsValue(0);
      const valueTrue = notificationsBlocker.getPushNotificationsValue(1);

      const expectedValueFalse = {
        ['HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications']: { // eslint-disable-line
          ToastEnabled: {
            value: 0,
            type: 'REG_DWORD',
          },
        },
      };

      const expectedValueTrue = {
        ['HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications']: { // eslint-disable-line
          ToastEnabled: {
            value: 1,
            type: 'REG_DWORD',
          },
        },
      };

      expect(valueFalse).to.eql(expectedValueFalse);
      expect(valueTrue).to.eql(expectedValueTrue);
    });
  });
});
