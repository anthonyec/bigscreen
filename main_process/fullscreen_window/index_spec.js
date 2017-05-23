const path = require('path');

const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const FullscreenWindow = require('./');
const { log } = require('../log');

describe('Fullscreen window', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('opens a new window with a URL', () => {
    const url = 'https://google.com';
    const expectedBrowserWindowArgs = {
      backgroundColor: '#000000',
      kiosk: true,
      webPreferences: {
        webgl: true,
        backgroundThrottling: false,
        preload: path.join(__dirname, 'preload.js'),
      },
    };

    const loadStub = sandbox.stub();
    const registerShortcutsStub = sandbox.stub();
    const addWindowEventsStub = sandbox.stub();
    const ipcMainOnStub = sandbox.stub();

    // Stub the electron's BrowserWindow with fake methods.
    function BrowserWindow() {
      this.on = sandbox.stub();
    }

    // Wrap the BrowserWindow in a spy.
    const browserWindowSpy = sandbox.spy(BrowserWindow);

    // Fake the electron module with the wrapped BrowserWindow method.
    const FullscreenWindowProxy = proxyquire('./', {
      electron: {
        BrowserWindow: browserWindowSpy,
        ipcMain: {
          on: ipcMainOnStub,
        },
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();
    fullscreenWindow.registerShortcuts = registerShortcutsStub;
    fullscreenWindow.addWindowEvents = addWindowEventsStub;
    fullscreenWindow.load = loadStub;

    fullscreenWindow.open(url);

    // Check the URL gets stored in the class, the reload method uses it.
    expect(fullscreenWindow.url).to.equal(url);

    // Check registerShortcuts, addWindowEvents and load get called.
    expect(registerShortcutsStub.calledOnce).to.equal(true);
    expect(addWindowEventsStub.calledOnce).to.equal(true);
    expect(loadStub.calledOnce).to.equal(true);

    // Check that new BrowserWindow gets called with the expected args.
    expect(browserWindowSpy.args[0][0]).to.eql(expectedBrowserWindowArgs);

    // Check that the ipcMain event for `window_log` gets added.
    expect(ipcMainOnStub.calledOnce).to.equal(true);
    expect(ipcMainOnStub.args[0][0]).to.equal('window_log');
  });

  it('closes the window and unregisters shortcuts', () => {
    const fullscreenWindow = new FullscreenWindow();
    const closeWindowStub = sandbox.stub();

    fullscreenWindow.window = sinon.createStubInstance(FullscreenWindow);
    fullscreenWindow.window.close = closeWindowStub;

    const unregisterShortcutsStub = sandbox.stub(
      fullscreenWindow,
      'unregisterShortcuts'
    );

    fullscreenWindow.close();

    expect(unregisterShortcutsStub.calledOnce).to.equal(true);
    expect(closeWindowStub.calledOnce).to.equal(true);
    expect(fullscreenWindow.window).to.equal(null);
  });

  it('reloads the window with the same URL', () => {
    const fullscreenWindow = new FullscreenWindow();
    const loadURLStub = sandbox.stub();

    fullscreenWindow.window = sinon.createStubInstance(FullscreenWindow);
    fullscreenWindow.window.loadURL = loadURLStub;

    fullscreenWindow.url = 'https://www.google.com/';
    const expectURL = fullscreenWindow.url;

    fullscreenWindow.load();

    expect(loadURLStub.calledOnce).to.equal(true);
    expect(loadURLStub.args[0][0]).to.equal(expectURL);
  });

  it('registers shortcuts', () => {
    const registerStub = sandbox.stub();
    const FullscreenWindowProxy = proxyquire('./', {
      electron: {
        globalShortcut: {
          register: registerStub,
        },
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();

    fullscreenWindow.registerShortcuts();

    expect(registerStub.callCount).to.equal(2);
    expect(registerStub.args[0][0]).to.equal('CommandOrControl+W');
    expect(registerStub.args[1][0]).to.equal('CommandOrControl+R');
  });

  it('unregisters shortcuts', () => {
    const expectedArgs = [
      ['CommandOrControl+W'],
      ['CommandOrControl+R'],
    ];

    const unregisterStub = sandbox.stub();
    const FullscreenWindowProxy = proxyquire('./', {
      electron: {
        globalShortcut: {
          unregister: unregisterStub,
        },
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();

    fullscreenWindow.unregisterShortcuts();

    expect(unregisterStub.callCount).to.equal(2);
    expect(unregisterStub.args).to.eql(expectedArgs);
  });

  it('add event handlers for webContents and window events', () => {
    const fullscreenWindow = new FullscreenWindow();
    const windowEventStub = sandbox.stub();
    const webContentsEventStub = sandbox.stub();

    fullscreenWindow.window = sinon.createStubInstance(FullscreenWindow);
    fullscreenWindow.window.webContents = sinon.createStubInstance(
      FullscreenWindow
    );

    fullscreenWindow.window.on = windowEventStub;
    fullscreenWindow.window.webContents.on = webContentsEventStub;

    fullscreenWindow.addWindowEvents();

    // Ensure the all the events get added.
    expect(windowEventStub.callCount).to.equal(2);
    expect(webContentsEventStub.callCount).to.equal(3);

    expect(windowEventStub.args[0][0]).to.equal('unresponsive');
    expect(windowEventStub.args[1][0]).to.equal('gpu-process-crashed');

    expect(webContentsEventStub.args[0][0]).to.equal('did-fail-load');
    expect(webContentsEventStub.args[1][0]).to.equal('certificate-error');
    expect(webContentsEventStub.args[2][0]).to.equal('crashed');
  });

  it('reloads URL if poll is successful', () => {
    const pollStub = sandbox.stub();
    const windowLoadStub = sandbox.stub();
    const infoStub = sandbox.stub();

    const FullscreenWindowProxy = proxyquire('./', {
      '../poll_url': {
        poll: pollStub,
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();

    fullscreenWindow.url = 'http://example.com';
    fullscreenWindow.load = windowLoadStub;
    log.info = infoStub;

    pollStub.callsFake((url, successCallback) => {
      successCallback();
    });

    fullscreenWindow.attemptToReconnect();

    expect(pollStub.calledOnce).to.equal(true);
    expect(pollStub.args[0][0]).to.equal('http://example.com');
    expect(windowLoadStub.calledOnce).to.equal(true);
    expect(infoStub.calledOnce).to.equal(true);
  });

  it('retries if poll is unsuccesfful', () => {
    const pollStub = sandbox.stub();
    const failedCallbackStub = sandbox.stub();
    const errorStub = sandbox.stub(log, 'error');

    const FullscreenWindowProxy = proxyquire('./', {
      '../poll_url': {
        poll: pollStub,
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();

    fullscreenWindow.url = 'http://example.com';

    pollStub.callsFake((url, successCallback, failedCallback) => {
      expect(errorStub.calledOnce).to.equal(true);
      failedCallback(failedCallbackStub);
    });

    fullscreenWindow.attemptToReconnect();

    expect(pollStub.calledOnce).to.equal(true);
    expect(pollStub.args[0][0]).to.equal('http://example.com');
    expect(failedCallbackStub.calledOnce).to.equal(true);
  });

  it('openFallback loads fallback URL and starts reconnection polling', () => {
    const FullscreenWindowProxy = proxyquire('./', {
      '../settings/paths': {
        FALLBACK_PATH: 'bigscreen/resources/fallback/index.html',
      },
    });
    const fullscreenWindow = new FullscreenWindowProxy();
    const loadURLStub = sandbox.stub();
    const attemptToReconnectStub = sandbox.stub();
    const expectedPath = path.join(
      'file://',
      'bigscreen/resources/fallback/index.html'
    );

    fullscreenWindow.window = sinon.createStubInstance(FullscreenWindow);
    fullscreenWindow.window.loadURL = loadURLStub;
    fullscreenWindow.attemptToReconnect = attemptToReconnectStub;

    fullscreenWindow.openFallback();

    expect(loadURLStub.calledOnce).to.equal(true);
    expect(loadURLStub.args[0][0]).to.equal(expectedPath);
    expect(attemptToReconnectStub.calledOnce).to.equal(true);
  });


  it('onWebContentsLog logs a debug with args passed into it', () => {
    const fullscreenWindow = new FullscreenWindow();
    const debugStub = sandbox.stub(log, 'debug');
    const expectedArgs = {
      a: 1,
      b: 2,
    };

    // Normally called by the 'window_log' event from ipcMain.
    fullscreenWindow.onWebContentsLog(null, expectedArgs);

    expect(debugStub.calledOnce).to.equal(true);
    expect(debugStub.args[0][0]).to.eql(expectedArgs);
  });

  it('onDidFailToLoad logs an error and opens fallback', () => {
    const fullscreenWindow = new FullscreenWindow();
    const openFallbackStub = sandbox.stub();
    const errorStub = sandbox.stub(log, 'error');
    const expectedLogArgs = [
      'did-fail-load',
    ];

    fullscreenWindow.openFallback = openFallbackStub;

    // Normally called by the 'certificate-error' event.
    fullscreenWindow.onDidFailToLoad();

    expect(errorStub.calledOnce).to.equal(true);
    expect(errorStub.args[0]).to.eql(expectedLogArgs);
    expect(openFallbackStub.calledOnce).to.equal(true);
  });

  it('onCertificateError logs a warn', () => {
    const fullscreenWindow = new FullscreenWindow();
    const warnStub = sandbox.stub();
    const expectedLogArgs = [
      'certificate-error',
    ];

    log.warn = warnStub;

    // Normally called by the 'certificate-error' event.
    fullscreenWindow.onCertificateError();

    // Expect the logger to be called with correct arguments.
    expect(warnStub.calledOnce).to.equal(true);
    expect(warnStub.args[0]).to.eql(expectedLogArgs);
  });

  it('onCrashed logs an error and reloads', () => {
    const fullscreenWindow = new FullscreenWindow();
    const reloadStub = sandbox.stub();
    const errorStub = sandbox.stub(log, 'error');
    const expectedLogArgs = [
      'crashed',
    ];


    // Replace reload with stub.
    fullscreenWindow.load = reloadStub;

    // Normally called by the 'crashed' event.
    fullscreenWindow.onCrashed();

    // Web page gets reloaded.
    expect(reloadStub.calledOnce).to.equal(true);

    // Expect the logger to be called with correct arguments.
    expect(errorStub.calledOnce).to.equal(true);
    expect(errorStub.args[0]).to.eql(expectedLogArgs);
  });

  it('onUnresponsive logs an error and reloads', () => {
    const fullscreenWindow = new FullscreenWindow();
    const reloadStub = sandbox.stub();
    const errorStub = sandbox.stub(log, 'error');
    const expectedLogArgs = [
      'unresponsive',
    ];


    // Replace reload with stub.
    fullscreenWindow.load = reloadStub;

    // Normally called by the 'unresponsive' event.
    fullscreenWindow.onUnresponsive();

    // Web page gets reloaded.
    expect(reloadStub.calledOnce).to.equal(true);

    // Expect the logger to be called with correct arguments.
    expect(errorStub.calledOnce).to.equal(true);
    expect(errorStub.args[0]).to.eql(expectedLogArgs);
  });

  it('onGPUCrashed logs an error and reloads', () => {
    const fullscreenWindow = new FullscreenWindow();
    const reloadStub = sandbox.stub();
    const errorStub = sandbox.stub(log, 'error');
    const expectedLogArgs = [
      'gpu-process-crashed',
    ];


    // Replace reload with stub.
    fullscreenWindow.load = reloadStub;

    // Normally called by the 'gpu-process-crashed' event.
    fullscreenWindow.onGPUCrashed();

    // Web page gets reloaded.
    expect(reloadStub.calledOnce).to.equal(true);

    // Expect the logger to be called with correct arguments.
    expect(errorStub.calledOnce).to.equal(true);
    expect(errorStub.args[0]).to.eql(expectedLogArgs);
  });
});
