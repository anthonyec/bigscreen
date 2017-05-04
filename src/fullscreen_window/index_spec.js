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
    const registerShortcutsStub = sandbox.stub();

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
    fullscreenWindow.registerShortcuts = registerShortcutsStub;

    fullscreenWindow.open(url);

    // Check the URL gets stored in the class, the reload method uses it.
    expect(fullscreenWindow.url).to.equal(url);

    // And that registerShortcuts get called.
    expect(registerShortcutsStub.calledOnce).to.equal(true);

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
    expect(registerStub.args[0][0]).to.equal('Q');
    expect(registerStub.args[1][0]).to.equal('R');
  });

  it('unregisters shortcuts', () => {
    const expectedArgs = [
      // Args look like this because forEach passes the key, index and array.
      ['Q', 0, ['Q', 'R']],
      ['R', 1, ['Q', 'R']],
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

  afterEach(() => {
    sandbox.restore();
  });
});
