const { expect } = require('chai');
const { sandbox } = require('sinon');
const path = require('path');
const proxyquire = require('proxyquire');
const chance = new require('chance').Chance(); // eslint-disable-line

const FullscreenWindow = require('./');
const FramelessFullscreenWindow = require('./frameless');

// Standard monitor sizes for convinience
const monitors = {
  1024: { x: 0, y: 0, width: 1024, height: 768 },
  1280: { x: 0, y: 0, width: 1280, height: 720 },
  1920: { x: 0, y: 0, width: 1920, height: 1080 },
  2560: { x: 0, y: 0, width: 2560, height: 1440 },
  '4k': { x: 0, y: 0, width: 4096, height: 2160 },
};

// Util for creating proxyquire'd FramelessFullscreenWindow with stubbed
// `electron.screen`
const createProxy = (getAllDisplays) => {
  return proxyquire('./frameless', {
    electron: {
      screen: { getAllDisplays },
    },
  });
};

// Convinience method to create display of position x/y and size width/height
const createDisplay = ({ x, y, width, height }) => {
  return {
    id: chance.integer(),
    bounds: { x, y, width, height },
    workArea: { x, y, width, height },
    size: { width, height },
    workAreaSize: { width, height },
    scaleFactor: chance.pickone([1, 2]),
  };
};

describe('FramelessFullscreenWindow', () => {
  let sbox;

  // Create sandbox to make it easier restore every stub after each test.
  beforeEach(() => {
    sbox = sandbox.create();
  });

  afterEach(() => sbox.restore());

  describe('getWindowSettings', () => {
    it('returns the correct extended settings', () => {
      const framelessWindow = new FramelessFullscreenWindow();

      const expected = {
        backgroundColor: '#000000',
        kiosk: false,
        frame: false,
        webPreferences: {
          webgl: true,
          backgroundThrottling: false,
          preload: path.join(__dirname, 'preload.js'),
        },
      };
      const result = framelessWindow.getWindowSettings();
      expect(expected).to.eql(result);
    });
  });

  describe('getWindowSize', () => {
    it('returns sizes for one monitor', () => {
      const getAllDisplaysStub = sbox.stub().returns([
        createDisplay(monitors['1024']),
      ]);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        width: 1024,
        height: 768,
      };
      const result = framelessWindow.getWindowSize();
      expect(result).to.eql(expected);
    });

    it('returns correct sizes for multiple monitors with same sizes', () => {
      const getAllDisplaysStub = sbox.stub().returns([
        createDisplay(monitors['4k']),
        createDisplay(monitors['4k']),
        createDisplay(monitors['4k']),
      ]);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        width: 12288,
        height: 2160,
      };
      const result = framelessWindow.getWindowSize();
      expect(result).to.eql(expected);
    });

    it('returns correct sizes for multiple monitors with different sizes', () => { // eslint-disable-line
      const getAllDisplaysStub = sbox.stub().returns([
        createDisplay(monitors['2560']),
        createDisplay(monitors['1024']),
        createDisplay(monitors['4k']),
        createDisplay(monitors['1280']),
        createDisplay(monitors['1920']),
      ]);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        width: 10880,
        height: 720,
      };
      const result = framelessWindow.getWindowSize();
      expect(result).to.eql(expected);
    });
  });

  describe('getWindowPosition', () => {
    it('returns position for aligned windows of same size', () => {
      const monitor = Object.assign({}, monitors['1920'], { x: 0, y: 100 });
      const getAllDisplaysStub = sbox.stub().returns([
        createDisplay(monitor),
        createDisplay(monitor),
        createDisplay(monitor),
      ]);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        x: 0,
        y: 100,
      };
      const result = framelessWindow.getWindowPosition();
      expect(result).to.eql(expected);
    });

    it('returns position for aligned windows of different size', () => {
      const output = [
        createDisplay(Object.assign({}, monitors['1920'], { x: 0, y: 0 })), // eslint-disable-line
        createDisplay(Object.assign({}, monitors['4k'], { x: 1920, y: 0 })),
        createDisplay(Object.assign({}, monitors['1024'], { x: 4016, y: 0 })),
      ];
      const getAllDisplaysStub = sbox.stub().returns(output);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        x: 0,
        y: 0,
      };
      const result = framelessWindow.getWindowPosition();
      expect(result).to.eql(expected);
    });

    it('returns left and bottom most position for misaligned windows of same size', () => { // eslint-disable-line
      const output = [
        createDisplay(Object.assign({}, monitors['1920'], { x: -3840, y: -100 })), // eslint-disable-line
        createDisplay(Object.assign({}, monitors['1920'], { x: -1920, y: 40 })),
        createDisplay(Object.assign({}, monitors['1920'], { x: 0, y: 120 })),
      ];
      const getAllDisplaysStub = sbox.stub().returns(output);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        x: -3840,
        y: 120,
      };
      const result = framelessWindow.getWindowPosition();
      expect(result).to.eql(expected);
    });

    it('returns left and bottom most position for misaligned windows of different size', () => { // eslint-disable-line
      const output = [
        createDisplay(Object.assign({}, monitors['1920'], { x: -1920, y: -200 })), // eslint-disable-line
        createDisplay(Object.assign({}, monitors['4k'], { x: 0, y: -10 })),
        createDisplay(Object.assign({}, monitors['1024'], { x: 4096, y: 200 })),
      ];
      const getAllDisplaysStub = sbox.stub().returns(output);
      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();
      const expected = {
        x: -1920,
        y: 200,
      };
      const result = framelessWindow.getWindowPosition();
      expect(result).to.eql(expected);
    });
  });

  describe('open', () => {
    it('calls setBounds on window object with correct bounds', () => {
      const getAllDisplaysStub = sbox.stub().returns([
        createDisplay(monitors['4k']),
        createDisplay(monitors['4k']),
      ]);

      // Stub for window.setBounds
      const setBoundsStub = sbox.stub();

      // Stub parent `open` method to create stubbed window
      sbox.stub(FullscreenWindow.prototype, 'open').callsFake(function() { // eslint-disable-line
        this.window = {
          setBounds: setBoundsStub,
        };
      });

      const Proxy = createProxy(getAllDisplaysStub);
      const framelessWindow = new Proxy();

      framelessWindow.open('http://foo.bar');

      const [args] = setBoundsStub.getCall(0).args;
      const expected = {
        width: 8192,
        height: 2160,
        x: 0,
        y: 0,
      };

      expect(setBoundsStub.calledOnce).to.equal(true);
      expect(args).to.eql(expected);
    });
  });
});
