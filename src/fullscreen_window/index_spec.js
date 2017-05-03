const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Fullscreen window', () => {
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

    const loadWindowStub = sinon.stub();

    // TODO: Explain this.
    function BrowserWindow() {
      this.loadURL = loadWindowStub;
      this.on = sinon.stub();
    }

    const browserWindowSpy = sinon.spy(BrowserWindow);

    const FullscreenWindow = proxyquire('./', {
      electron: {
        BrowserWindow: browserWindowSpy,
      },
    });

    const fullscreenWindow = new FullscreenWindow();

    fullscreenWindow.open(url);

    // Check the URL gets stored in the class, the reload method uses it.
    expect(fullscreenWindow.url).to.equal(url);

    // Check that new BrowserWindow gets called with the expected args.
    expect(browserWindowSpy.args[0][0]).to.eql(expectedBrowserWindowArgs);

    // loadURL should get called once with the URL.
    expect(loadWindowStub.calledOnce).to.equal(true);
    expect(loadWindowStub.args[0][0]).to.equal(url);
  });

  xit('closes the window and unregisters shortcuts', () => {
  });

  xit('reloads the window with the same URL', () => {
  });

  xit('registers shortcuts', () => {
  });

  xit('unregisters shortcuts', () => {
  });
});
