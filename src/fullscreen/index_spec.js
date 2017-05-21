const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');
const electronSettings = require('electron-settings');

const fullscreen = require('./');
const FullscreenWindow = require('../fullscreen_window');
const autolaunch = require('../autolaunch');
const keepAlive = require('../keep_alive');
const sleepBlocker = require('../sleep_blocker');

const {
  FULLSCREEN_IS_RUNNING,
} = require('../settings/attributes');

describe('Fullscreen', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('getFullscreenWindowFactory', () => {
    it('creates logger instance and caches it', () => {
      const FullscreenWindowWrapper = sandbox.spy(function() { // eslint-disable-line
        return sinon.createStubInstance(FullscreenWindow);
      });

      const fullscreenProxy = proxyquire('./', {
        '../fullscreen_window': FullscreenWindowWrapper,
      });

      const returnedFunction = fullscreenProxy.getFullscreenWindowFactory();
      returnedFunction();

      // Call second time to ensure logger is cached.
      returnedFunction();

      // Expect FullscreenWindow to only be instantiated once because it was
      // cached the first time returnedFunction was called.
      expect(FullscreenWindowWrapper.calledOnce).to.equal(true);
    });
  });

  describe('wasFullscreenRunning', () => {
    it('gets the electron-setting to see if it is true or false', () => {
      const electronSettingGetStub = sandbox.stub(electronSettings, 'get');

      electronSettingGetStub.returns(true);

      const firstResult = fullscreen.wasFullscreenRunning();
      electronSettingGetStub.returns(false);

      const secondResult = fullscreen.wasFullscreenRunning();

      expect(firstResult).to.equal(true);
      expect(secondResult).to.equal(false);
      expect(electronSettingGetStub.args).to.eql([
        [FULLSCREEN_IS_RUNNING],
        [FULLSCREEN_IS_RUNNING],
      ]);
    });
  });

  describe('shouldFullscreenStart', () => {
    it('returns true if isAutoLaunchEnabled or wasFullscreenRunning', () => {
      const isAutoLaunchEnabledStub = sandbox.stub(
        autolaunch,
        'isAutoLaunchEnabled'
      );
      const wasFullscreenRunningStub = sandbox.stub(
        fullscreen,
        'wasFullscreenRunning'
      );

      // false || false
      isAutoLaunchEnabledStub.returns(false);
      wasFullscreenRunningStub.returns(false);
      const firstResult = fullscreen.shouldFullscreenStart();

      // true || false
      isAutoLaunchEnabledStub.returns(true);
      wasFullscreenRunningStub.returns(false);
      const secondResult = fullscreen.shouldFullscreenStart();

      // true || true
      isAutoLaunchEnabledStub.returns(true);
      wasFullscreenRunningStub.returns(true);
      const thirdResult = fullscreen.shouldFullscreenStart();

      expect(firstResult).to.equal(false);
      expect(secondResult).to.equal(true);
      expect(thirdResult).to.equal(true);

      expect(isAutoLaunchEnabledStub.callCount).to.equal(3);

      // Called only once because isAutoLauch is evaluated first then returned.
      expect(wasFullscreenRunningStub.callCount).to.equal(1);
    });
  });

  describe('openWindowAndBindEvents', () => {
    it('opens the fullscreen_window with electron-setting URL', () => {
      const expectedURL = 'https://example.com';
      const electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
      const FullscreenWindowWrapper = sandbox.spy(function() { // eslint-disable-line
        return sinon.createStubInstance(FullscreenWindow);
      });

      const fullscreenProxy = proxyquire('./', {
        '../fullscreen_window': FullscreenWindowWrapper,
      });

      electronSettingsGetStub.returns('https://example.com');

      fullscreenProxy.window = sinon.createStubInstance(FullscreenWindow);
      fullscreenProxy.window.open = sandbox.stub();
      fullscreenProxy.window.getWindow = sandbox.stub();
      fullscreenProxy.window.getWindow.returns({
        once: sinon.stub(),
      });

      fullscreenProxy.openWindowAndBindEvents();
      expect(fullscreenProxy.window.open.calledOnce).to.equal(true);
      expect(fullscreenProxy.window.open.args[0][0]).equal(expectedURL);
    });

    it('binds once window close event to stop', () => {
      const electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
      const onceStub = sandbox.stub();
      const FullscreenWindowWrapper = sandbox.spy(function() { // eslint-disable-line
        return sinon.createStubInstance(FullscreenWindow);
      });

      const fullscreenProxy = proxyquire('./', {
        '../fullscreen_window': FullscreenWindowWrapper,
      });

      electronSettingsGetStub.returns('https://example.com');

      fullscreenProxy.window = sinon.createStubInstance(FullscreenWindow);
      fullscreenProxy.window.open = sandbox.stub();
      fullscreenProxy.window.getWindow = sandbox.stub();
      fullscreenProxy.window.getWindow.returns({
        once: onceStub,
      });

      fullscreenProxy.openWindowAndBindEvents();

      expect(onceStub.calledOnce).to.equal(true);
      expect(onceStub.args[0][0]).to.equal('close');
    });
  });

  describe('start', () => {
    it('sets FULLSCREEN_IS_RUNNING to true and enables sleep blocking and keep alive', () => { // eslint-disable-line
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const enableSleepBlockingStub = sandbox.stub(
        sleepBlocker,
        'enableSleepBlocking'
      );
      const enableKeepAliveStub = sandbox.stub(
        keepAlive,
        'enableKeepAlive'
      );
      const openWindowAndBindEventsStub = sandbox.stub(
        fullscreen,
        'openWindowAndBindEvents'
      );

      fullscreen.start();

      expect(openWindowAndBindEventsStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(enableSleepBlockingStub.calledOnce).to.equal(true);
      expect(enableKeepAliveStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql([
        FULLSCREEN_IS_RUNNING,
        true
      ]);
    });
  });

   describe('stop', () => {
    it('sets FULLSCREEN_IS_RUNNING to false and disables sleep blocking and keep alive', () => { // eslint-disable-line
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const disableSleepBlockingStub = sandbox.stub(
        sleepBlocker,
        'disableSleepBlocking'
      );
      const disableKeepAliveStub = sandbox.stub(
        keepAlive,
        'disableKeepAlive'
      );
      const openWindowAndBindEventsStub = sandbox.stub(
        fullscreen,
        'openWindowAndBindEvents'
      );

      fullscreen.stop();

      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(disableSleepBlockingStub.calledOnce).to.equal(true);
      expect(disableKeepAliveStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql([
        FULLSCREEN_IS_RUNNING,
        false
      ]);
    });
  });
});
