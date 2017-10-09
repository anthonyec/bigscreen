const { expect } = require('chai');
const sinon = require('sinon');
const proxyquire = require('proxyquire');

describe('Restart OS shell util', () => {
  let sandbox;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('restartWindowsExplorer', () => {
    it('calls PowerShell with correct command', (done) => {
      const expectedCommand = 'Stop-Process -ProcessName Explorer';
      const onSpy = sandbox.spy((event, callback) => {
        if (event === 'end') {
          callback();
        }
      });

      const powerShellSpy = sandbox.spy(function PowerShell() {
        this.on = onSpy;
      });

      const restartWindowsExplorer = proxyquire('./win32', {
        powershell: powerShellSpy,
      });

      restartWindowsExplorer().then(() => {
        expect(powerShellSpy.args[0][0]).to.equal(expectedCommand);

        expect(onSpy.args[0][0]).to.equal('error');
        expect(onSpy.args[1][0]).to.equal('end');

        done();
      }).catch(done);
    });
  });
});
