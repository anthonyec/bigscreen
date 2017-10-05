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
});
