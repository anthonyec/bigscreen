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

describe('Fullscreen Controller', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
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

  describe('openWindow', () => {
    it('opens the fullscreen_window and binds once event', () => {
      const expectedURL = 'https://example.com';
      const openStub = sandbox.stub();
      const getWindowStub = sandbox.stub();
      const electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
      const fullscreenStub = sinon.createStubInstance(FullscreenWindow);

      const FullscreenWindowWrapper = sandbox.spy(function() { // eslint-disable-line
        return fullscreenStub;
      });

      const fullscreenControllerProxy = proxyquire('./', {
        '../fullscreen_window': FullscreenWindowWrapper,
      });

      electronSettingsGetStub.returns('https://example.com');
      fullscreenStub.open = openStub;
      fullscreenStub.getWindow = getWindowStub;
      getWindowStub.returns({
        once: sinon.stub(),
      });

      fullscreenControllerProxy.openWindow();

      expect(openStub.calledOnce).to.equal(true);
      expect(openStub.args[0][0]).equal(expectedURL);
    });

    it('binds once window close event to stop', () => {
      const onceStub = sandbox.stub();
      const openStub = sandbox.stub();
      const getWindowStub = sandbox.stub();
      const electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
      const fullscreenStub = sinon.createStubInstance(FullscreenWindow);

      const FullscreenWindowWrapper = sandbox.spy(function() { // eslint-disable-line
        return fullscreenStub;
      });

      const fullscreenControllerProxy = proxyquire('./', {
        '../fullscreen_window': FullscreenWindowWrapper,
      });

      electronSettingsGetStub.returns('https://example.com');
      fullscreenStub.open = openStub;
      fullscreenStub.getWindow = getWindowStub;
      getWindowStub.returns({
        once: onceStub,
      });

      fullscreenControllerProxy.openWindow();

      expect(getWindowStub.calledOnce).to.equal(true);
      expect(onceStub.calledOnce).to.equal(true);
      expect(onceStub.args[0][0]).to.equal('close');
    });
  });

  describe('start', () => {
    it('opens window and starty processes only if instance does not exist', () => { // eslint-disable-line
      const openWindowStub = sandbox.stub(fullscreen, 'openWindow');
      const startProcessesStub = sandbox.stub(fullscreen, 'startProcesses');

      // Call start and pretend fullscreenWindow not to exist. This should
      // call the openWindow and startProcesses functions once.
      fullscreen.fullscreenWindow = false;
      fullscreen.start();

      // Call it a second time but pretend fullscreenWindow exists
      fullscreen.fullscreenWindow = true;
      fullscreen.start();

      expect(openWindowStub.calledOnce).to.equal(true);
      expect(startProcessesStub.calledOnce).to.equal(true);
    });
  });

  describe('stop', () => {
    it('closes window only if instance and window instance exists', () => {
      const getWindowStub = sandbox.stub();
      const closeWindowStub = sandbox.stub();

      // Call start.
      fullscreen.fullscreenWindow = sinon.createStubInstance(FullscreenWindow);
      fullscreen.fullscreenWindow.getWindow = getWindowStub;
      fullscreen.closeWindow = closeWindowStub;

      fullscreen.stop();

      // Call it a second time.
      getWindowStub.returns(true);
      fullscreen.stop();

      expect(getWindowStub.calledTwice).to.equal(true);
      expect(closeWindowStub.calledOnce).to.equal(true);
    });
  });

  describe('startProcesses', () => {
    it('enables sleep blocker, keep alive and sets electron-setting', () => {
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const enableKeepAliveStub = sandbox.stub(keepAlive, 'enableKeepAlive');
      const enableSleepBlockingStub = sandbox.stub(
        sleepBlocker,
        'enableSleepBlocking'
      );

      fullscreen.startProcesses();

      expect(enableKeepAliveStub.calledOnce).to.equal(true);
      expect(enableSleepBlockingStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql([
        FULLSCREEN_IS_RUNNING,
        true,
      ]);
    });
  });

  describe('stopProcesses', () => {
    it('disables sleep blocker, keep alive and sets electron-setting', () => {
      const electronSettingsSetStub = sandbox.stub(electronSettings, 'set');
      const disableKeepAliveStub = sandbox.stub(keepAlive, 'disableKeepAlive');
      const disableSleepBlockingStub = sandbox.stub(
        sleepBlocker,
        'disableSleepBlocking'
      );

      fullscreen.stopProcesses();

      expect(disableKeepAliveStub.calledOnce).to.equal(true);
      expect(disableSleepBlockingStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.calledOnce).to.equal(true);
      expect(electronSettingsSetStub.args[0]).to.eql([
        FULLSCREEN_IS_RUNNING,
        false,
      ]);
    });
  });
});
