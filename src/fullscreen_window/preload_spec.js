const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Preload script', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  it('wrap object methods with function', () => {
    const logStub = sandbox.stub();
    const debugStub = sandbox.stub();
    const icpRendererStub = sandbox.stub();

    const preload = proxyquire('./preload', {
      electron: {
        ipcRenderer: {
          send: icpRendererStub,
        },
      },
    });

    const expectedObjectArg = {
      foo: 'bar',
      baz: 'boo',
    };

    const fakeConsole = {
      log: logStub,
      debug: debugStub,
    }

    const result = preload.wrapMethodsWithIPCEvent(fakeConsole, 'test_event');

    result.log('log test');
    result.debug('debug test', {
      foo: 'bar',
      baz: 'boo',
    });

    // Make sure the wrapped functions get called.
    expect(logStub.calledOnce).to.equal(true);
    expect(debugStub.calledOnce).to.equal(true);

    // Make sure the ICP send event method is called twice. Each for log
    // and debug func calls.
    expect(icpRendererStub.calledTwice).to.equal(true);

    // Make sure the wrapped functions pass the correct arguments.
    expect(logStub.args[0][0]).to.equal('log test');
    expect(debugStub.args[0][0]).to.equal('debug test');
    expect(debugStub.args[0][1]).to.eql(expectedObjectArg);

    // Test ICP event has the arguments from the log call.
    expect(icpRendererStub.args[0][0]).to.equal('test_event');
    expect(icpRendererStub.args[0][1].arguments[0]).to.equal('log test')

    // Test ICP event has the arguments from the debug call.
    expect(icpRendererStub.args[1][0]).to.equal('test_event');
    expect(icpRendererStub.args[1][1].arguments[0]).to.equal('debug test')
  });

  afterEach(() => {
    sandbox.restore();
  });
});
