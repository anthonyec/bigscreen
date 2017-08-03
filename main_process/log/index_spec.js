const path = require('path');

const os = require('os');
const { expect } = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');
const { app } = require('electron');
const proxyquire = require('proxyquire');

const log = require('./');

describe('Log', () => {
  let sandbox;
  let bunyanCreateLoggerStub;
  let bunyanDebugStub;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
    bunyanCreateLoggerStub = sandbox.stub(bunyan, 'createLogger');
    bunyanCreateLoggerStub.returns({
      debug: () => {},
    });
    bunyanDebugStub = sandbox.stub(log.log, 'debug');
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('getLoggerFactory creates logger instance and caches it', () => {
    const isReadyStub = sandbox.stub();
    const loggerProxy = proxyquire('./', {
      electron: {
        app: {
          isReady: isReadyStub,
          getPath: () => '/users/',
        },
      },
    });
    const startLoggerStub = sandbox.stub(loggerProxy, 'startLogger');

    // Need to make sure startLogger returns something otherwise it won't think
    // it's cached.
    startLoggerStub.returns(true);
    isReadyStub.returns(true);

    const returnedFunction = loggerProxy.getLoggerFactory();
    const firstReturnedValue = returnedFunction();

    // Call second time to ensure AutoLaunch is cached.
    const secondReturnedValue = returnedFunction();

    // Expect logger to only be created once because it was cached the first
    // time returnedFunction was called.
    expect(startLoggerStub.calledOnce).to.equal(true);
    expect(isReadyStub.calledTwice).to.equal(true);
    expect(firstReturnedValue).to.equal(secondReturnedValue);
  });

  it('getLoggerFactory throws error if app is not ready', () => {
    const isReadyStub = sandbox.stub();
    const loggerProxy = proxyquire('./', {
      electron: {
        app: {
          isReady: isReadyStub,
          getPath: () => '/users/',
        },
      },
    });

    isReadyStub.returns(false);

    const returnedFunction = loggerProxy.getLoggerFactory();
    const expectedError = 'Can\'t use logger before the app is ready.';

    // This does not use a try/catch because If returnedFunction does not
    // throw, it will never end up in the catch. So the function call is
    // wrapped in a method instead.
    const call = () => returnedFunction();

    expect(call).to.throw(expectedError);
    expect(isReadyStub.calledOnce).to.equal(true);
  });

  it('should call bunyan with correct arguments', () => {
    const logPath = path.join(app.getPath('userData'), 'log');
    const expectedArgs = {
      name: 'bigscreen',
      streams: [
        {
          level: 'trace',
          type: 'rotating-file',
          path: logPath,
          period: '1d',
          count: 7,
        },
      ],
    };

    log.startLogger();
    const args = bunyanCreateLoggerStub.args[0][0];

    expect(bunyanCreateLoggerStub.calledOnce).to.equal(true);
    expect(args).to.be.eql(expectedArgs);
  });

  it('gets the correct system details', () => {
    const oldDetails = log.SYSTEM_DETAILS;
    const newDetails = ['foo', 'bar', 'baz'];
    log.SYSTEM_DETAILS = newDetails;

    const stubs = newDetails.map((detail) => {
      let stub;

      // Check if os already has a method with the same name as `detail`.
      if (os[detail]) {
        // If it does, stub directly
        stub = sinon.stub(os, detail);
      } else {
        // If it doesn't, we have to set an empty stub as an object property
        // that will remove itself when restored.
        stub = sinon.stub();
        stub.restore = () => delete os[detail];
        os[detail] = stub;
      }

      stub.returns(detail);
      return stub;
    });

    const result = log.getSystemDetails();

    stubs.forEach((stub) => stub.restore());
    log.SYSTEM_DETAILS = oldDetails;

    expect(result).to.eql({
      foo: 'foo',
      bar: 'bar',
      baz: 'baz',
    });
  });

  it('logs system details', () => {
    const details = { foo: 1, bar: 2 };
    const getSystemDetailsStub = sinon.stub(log, 'getSystemDetails');
    getSystemDetailsStub.returns(details);

    log.logSystemDetails();

    expect(getSystemDetailsStub.calledOnce).to.equal(true);
    expect(bunyanDebugStub.calledOnce).to.equal(true);
    expect(bunyanDebugStub.args[0][0]).to.eql({ osInfo: details });

    getSystemDetailsStub.restore();
  });
});
