const os = require('os');

const { expect } = require('chai');
const sinon = require('sinon');

const keepAlive = require('./');
const keepAliveDarwin = require('./darwin');

describe('KeepAlive', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getPlatformAPI', () => {
    it('returns darwin specific methods when platform is `darwin`', () => {
      const getPlatformStub = sandbox.stub(keepAlive, 'getPlatform');

      // Stub the darwin platform specific methods.
      const enableKeepAliveStub = sandbox.stub(
        keepAliveDarwin,
        'enableKeepAlive'
      );

      const disableKeepAliveStub = sandbox.stub(
        keepAliveDarwin,
        'disableKeepAlive'
      );

      getPlatformStub.returns('darwin');

      const api = keepAlive.getPlatformAPI();
      api.enableKeepAlive();
      api.disableKeepAlive();

      // Expect the darwin methods to be called.
      expect(enableKeepAliveStub.calledOnce).to.equal(true);
      expect(disableKeepAliveStub.calledOnce).to.equal(true);
    });

    it('returns dummy methods when platform is not supported', () => {
      const getPlatformStub = sandbox.stub(keepAlive, 'getPlatform');
      const dummyMethodSub = sandbox.stub(keepAlive, 'dummyMethod');

      getPlatformStub.returns('unsupported_OS');

      const api = keepAlive.getPlatformAPI();
      api.enableKeepAlive();
      api.disableKeepAlive();

      // Expect the darwin methods to be called.
      expect(dummyMethodSub.calledTwice).to.equal(true);
    });
  });

  describe('dummyMethod', () => {
    it('returns a resolved promise', () => {
      return keepAlive.dummyMethod().then();
    });
  });

  describe('getPlatform', () => {
    it('calls os platform method', () => {
      const osPlatformStub = sandbox.stub(os, 'platform');

      osPlatformStub.returns('my_cool_os');

      const platorm = keepAlive.getPlatform();

      expect(osPlatformStub.calledOnce).to.equal(true);
      expect(platorm).to.equal('my_cool_os');
    });
  });
});
