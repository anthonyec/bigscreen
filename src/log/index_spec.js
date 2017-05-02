const path = require('path');

const os = require('os');
const { expect } = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');
const { app } = require('electron');

const log = require('./');

describe('Log', () => {
  let sandbox;
  let bunyanCreateLoggerStub;
  let bunyanDebugStub;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
    bunyanCreateLoggerStub = sandbox.stub(bunyan, 'createLogger');
    bunyanDebugStub = sandbox.stub(log.log, 'debug');
  });

  it('should call bunyan with correct arguments', () => {
    const logPath = path.join(app.getPath('userData'), 'log');
    const expectedArgs = {
      name: 'bigscreen',
      streams: [
        { level: 'fatal', path: logPath },
        { level: 'error', path: logPath },
        { level: 'warn', path: logPath },
        { level: 'info', path: logPath },
        { level: 'debug', path: logPath },
        { level: 'trace', path: logPath },
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
    log.logSystemDetails();
    expect(bunyanDebugStub.calledOnce).to.equal(true);
  });

  afterEach(() => {
    sandbox.restore();
  });
});
