const os = require('os');
const { expect } = require('chai');
const sinon = require('sinon');

const getPlatformAPI = require('./get_platform_api');

describe('Get platform specfic API util', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPlatformAPI', () => {
    it('returns darwin specific methods when platform is `win32`', () => {
      const osPlatformStub = sandbox.stub(os, 'platform');
      const win32Method = sandbox.stub();
      const darwinMethod = sandbox.stub();
      const noopStub = sandbox.stub();

      osPlatformStub.returns('win32');

      const api = getPlatformAPI({
        win32: {
          doSomething: win32Method,
        },
        darwin: {
          doSomething: darwinMethod,
        },
      }, noopStub);

      api.doSomething();

      expect(win32Method.calledOnce).to.equal(true);
      expect(darwinMethod.calledOnce).to.equal(false);
      expect(noopStub.calledOnce).to.equal(false);
    });

    it('returns dummy noop methods when platform is not supported', () => {
      const osPlatformStub = sandbox.stub(os, 'platform');
      const win32Method = sandbox.stub();
      const darwinMethod = sandbox.stub();
      const noopStub = sandbox.stub();

      osPlatformStub.returns('unsupported_os');

      const api = getPlatformAPI({
        win32: {
          doSomething: win32Method,
        },
        darwin: {
          doSomething: darwinMethod,
        },
      }, noopStub);

      api.doSomething();

      expect(win32Method.calledOnce).to.equal(false);
      expect(darwinMethod.calledOnce).to.equal(false);
      expect(noopStub.calledOnce).to.equal(true);
    });
  });
});
