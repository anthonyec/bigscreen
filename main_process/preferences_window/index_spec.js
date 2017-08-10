const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

const PreferencesWindow = require('./');

describe('Preferences window', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('opens a new window with a URL', () => {
    const expectedPath = 'file://path/renderer_process/dist/index.html';
    const expectedBrowserWindowArgs = {
      useContentSize: true,
      width: 450,
      height: 180,
      resizable: false,
      show: false,
      kiosk: false,
    };

    const loadStub = sandbox.stub();
    const onStub = sandbox.stub();
    const onContextMenuStub = sandbox.stub();

    function BrowserWindow() {
      this.loadURL = loadStub;
      this.on = onStub;
      this.webContents = {
        on: onContextMenuStub,
      };
    }

    const browserWindowSpy = sandbox.spy(BrowserWindow);

    // Fake the electron module with the wrapped BrowserWindow method.
    const PreferencesWindowProxy = proxyquire('./', {
      electron: {
        app: {
          getAppPath: () => {
            return 'path';
          },
        },
        BrowserWindow: browserWindowSpy,
      },
    });

    const preferencesWindowProxy = new PreferencesWindowProxy();

    preferencesWindowProxy.open();

    expect(browserWindowSpy.args[0][0]).to.eql(expectedBrowserWindowArgs);
    expect(loadStub.calledOnce).to.equal(true);
    expect(loadStub.args[0][0]).to.equal(expectedPath);
    expect(onStub.calledOnce).to.equal(true);
    expect(onStub.args[0][0]).to.equal('ready-to-show');
    expect(onContextMenuStub.calledOnce).to.equal(true);
    expect(onContextMenuStub.args[0][0]).to.equal('context-menu');
  });

  it('dev environment opens devtools and uses localhost URL', () => {
    const orginalNodeEnv = process.env.NODE_ENV;
    const expectedPath = 'http://lvh.me:8080/';
    const expectedBrowserWindowArgs = {
      useContentSize: true,
      width: 450,
      height: 180,

      // Should be true when running in the "development" environment.
      resizable: true,
      show: false,
      kiosk: false,
    };

    const loadStub = sandbox.stub();
    const onStub = sandbox.stub();
    const openDevToolsStub = sandbox.stub();
    const onContextMenuStub = sandbox.stub();

    function BrowserWindow() {
      this.loadURL = loadStub;
      this.on = onStub;
      this.openDevTools = openDevToolsStub;
      this.webContents = {
        on: onContextMenuStub,
      };
    }

    const browserWindowSpy = sandbox.spy(BrowserWindow);

    // Change environment to development as this test requires that.
    process.env.NODE_ENV = 'development';

    // Fake the electron module with the wrapped BrowserWindow method.
    const PreferencesWindowProxy = proxyquire('./', {
      electron: {
        app: {
          getAppPath: () => {
            return 'path';
          },
        },
        BrowserWindow: browserWindowSpy,
      },
    });

    const preferencesWindowProxy = new PreferencesWindowProxy();

    preferencesWindowProxy.open();

    expect(loadStub.calledOnce).to.equal(true);
    expect(loadStub.args[0][0]).to.equal(expectedPath);

    expect(openDevToolsStub.calledOnce).to.equal(true);
    expect(openDevToolsStub.args[0][0]).to.eql({ detach: true });

    expect(browserWindowSpy.args[0][0]).to.eql(expectedBrowserWindowArgs);

    expect(onContextMenuStub.calledOnce).to.equal(true);
    expect(onContextMenuStub.args[0][0]).to.equal('context-menu');

    // Change the environment back to what it was originally. In this case,
    // probably "test".
    process.env.NODE_ENV = orginalNodeEnv;
  });

  it('closes window', () => {
    const preferencesWindow = new PreferencesWindow();
    const closeWindowStub = sandbox.stub();

    preferencesWindow.window = sinon.createStubInstance(PreferencesWindow);
    preferencesWindow.window.close = closeWindowStub;

    preferencesWindow.close();

    expect(closeWindowStub.calledOnce).to.equal(true);
    expect(preferencesWindow.window).to.equal(null);
  });
});
