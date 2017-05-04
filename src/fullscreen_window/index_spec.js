const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const FullscreenWindow = require('./');

describe('Fullscreen window', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  it('opens a new window with a URL', () => {
    const url = 'https://google.com';
    const expectedBrowserWindowArgs = {
      backgroundColor: '#000000',
      kiosk: true,
      webPreferences: {
        webgl: true,
        backgroundThrottling: false,
      },
    };

    const loadWindowStub = sandbox.stub();

    // Stub the electron's BrowserWindow with fake methods.
    function BrowserWindow() {
      this.loadURL = loadWindowStub;
      this.on = sandbox.stub();
    }

    // Wrap the BrowserWindow in a spy.
    const browserWindowSpy = sandbox.spy(BrowserWindow);

    // Fake the electron module with the wrapped BrowserWindow method.
    const FullscreenWindowProxy = proxyquire('./', {
      electron: {
        BrowserWindow: browserWindowSpy,
      },
    });

    const fullscreenWindow = new FullscreenWindowProxy();
    fullscreenWindow.open(url);

    // Check the URL gets stored in the class, the reload method uses it.
    expect(fullscreenWindow.url).to.equal(url);

    // Check that new BrowserWindow gets called with the expected args.
    expect(browserWindowSpy.args[0][0]).to.eql(expectedBrowserWindowArgs);

    // loadURL should get called once with the URL.
    expect(loadWindowStub.calledOnce).to.equal(true);
    expect(loadWindowStub.args[0][0]).to.equal(url);
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

    fullscreenWindow.reload();

    expect(loadURLStub.calledOnce).to.equal(true);
    expect(loadURLStub.args[0][0]).to.equal(expectURL);
  });

  xit('registers shortcuts', () => {
  });

  xit('unregisters shortcuts', () => {
  });

  afterEach(() => {
    sandbox.restore();
  });
});
