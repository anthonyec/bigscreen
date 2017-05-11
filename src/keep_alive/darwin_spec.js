const fs = require('fs');
const path = require('path');

const { expect } = require('chai');
const sinon = require('sinon');
const bunyan = require('bunyan');
const proxyquire = require('proxyquire');
const electronSettings = require('electron-settings');
const plist = require('plist');

const expectedPlistFileObject = {
  label: 'Bigscreen',
  ProgramArguments: [__dirname],
  NSQuitAlwaysKeepsWindows: false,
  KeepAlive: { SuccessfulExit: false },
};

describe('KeepAlive darwin', () => {
  let sandbox;
  let darwinKeepAliveProxy;
  let electronSettingsGetStub;

  beforeEach(() => {
    // Create sandbox to make it easier restore every stub after each test.
    sandbox = sinon.sandbox.create();

    // Force LABEL to default to "Bigscreen".
    electronSettingsGetStub = sandbox.stub(electronSettings, 'get');
    electronSettingsGetStub.returns(false);

    // Override path consts with our fake file system paths.
    darwinKeepAliveProxy = proxyquire('./darwin', {
      '../settings/paths': {
        EXE_PATH: __dirname,
        HOME_PATH: '/Users/Jane',
        LAUNCH_AGENTS_PATH: '/Users/Jane/Library/LaunchAgents',
      },
    });
  });

  afterEach(() => {
    sandbox.restore();
  });

  describe('createLaunchAgentsDir', () => {
    it('calls mkdir to create directory', () => {
      const mkdirStub = sandbox.stub(fs, 'mkdir');

      mkdirStub.callsFake((path, callback) => {
        callback();
      });

      darwinKeepAliveProxy.createLaunchAgentsDir().then(() => {
        const pathArg = mkdirStub.args[0][0];

        expect(mkdirStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal('/Users/Jane/Library/LaunchAgents');
      });
    });

    it('handles error creating directory', () => {
      const mkdirStub = sandbox.stub(fs, 'mkdir');

      mkdirStub.callsFake((path, callback) => {
        callback('error');
      });

      darwinKeepAliveProxy.createLaunchAgentsDir().catch(() => {
        expect(mkdirStub.calledOnce).to.equal(true);
      });
    });
  });

  describe('ensureLaunchAgentsDirExists', () => {
    it('resolves if LaunchAgents directory exists', (done) => {
      const accessStub = sandbox.stub(fs, 'access');

      accessStub.callsFake((path, mode, callback) => {
        callback();
      });

      darwinKeepAliveProxy.ensureLaunchAgentsDirExists().then(() => {
        const pathArg = accessStub.args[0][0];
        const modeArg = accessStub.args[0][1];

        expect(pathArg).to.equal('/Users/Jane/Library/LaunchAgents');
        expect(modeArg).to.equal(fs.constants.W_OK);
        done();
      });
    });

    it('calls createLaunchAgentsDir if directory does not exist', (done) => {
      const accessStub = sandbox.stub(fs, 'access');
      const createLaunchAgentsDirStub = sandbox.stub(
        darwinKeepAliveProxy,
        'createLaunchAgentsDir'
      );

      createLaunchAgentsDirStub.returns(Promise.resolve());

      accessStub.callsFake((path, mode, callback) => {
        callback({ code: 'ENOENT' });
      });

      darwinKeepAliveProxy.ensureLaunchAgentsDirExists().then(() => {
        expect(createLaunchAgentsDirStub.calledOnce).to.equal(true);
        done();
      });
    });

    it('handles any other error that is not ENOENT', (done) => {
      const accessStub = sandbox.stub(fs, 'access');
      const createLaunchAgentsDirStub = sandbox.stub(
        darwinKeepAliveProxy,
        'createLaunchAgentsDir'
      );

      createLaunchAgentsDirStub.returns(Promise.resolve());

      accessStub.callsFake((path, mode, callback) => {
        callback({ code: 'EACCESS' });
      });

      darwinKeepAliveProxy.ensureLaunchAgentsDirExists().catch((err) => {
        expect(err).to.eql({ code: 'EACCESS' });
        expect(createLaunchAgentsDirStub.calledOnce).to.equal(false);
        done();
      });
    });
  });

  describe('enableKeepAlive', () => {
    it('calls ensureLaunchAgentsDirExists then calls writeFile', (done) => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const plistBuildStub = sandbox.stub(plist, 'build');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((path, file, callback) => {
        callback();
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.resolve());

      darwinKeepAliveProxy.enableKeepAlive().then(() => {
        const pathArg = writeFileStub.args[0][0];
        const expectedPath =
          '/Users/Jane/Library/LaunchAgents/Bigscreen.keepalive.plist';

        expect(writeFileStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal(expectedPath);
        expect(plistBuildStub.calledOnce).to.equal(true);
        expect(plistBuildStub.args[0][0]).to.eql(expectedPlistFileObject);
        done();
      });
    });

    it('handles error when ensureLaunchAgentsDirExists fails', (done) => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((path, file, callback) => {
        callback();
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.reject());

      darwinKeepAliveProxy.enableKeepAlive().catch(() => {
        expect(writeFileStub.calledOnce).to.equal(false);
        done();
      });
    });

    it('handles error when it fails to write the file', (done) => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((path, file, callback) => {
        callback('error');
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.resolve());

      darwinKeepAliveProxy.enableKeepAlive().catch((err) => {
        expect(writeFileStub.calledOnce).to.equal(true);
        expect(err).to.equal('error');
        done();
      });
    });
  });

  describe('disableKeepAlive', () => {
    it('calls unlink', (done) => {
      const unlinkStub = sandbox.stub(fs, 'unlink');

      unlinkStub.callsFake((path, callback) => {
        callback();
      });

      darwinKeepAliveProxy.disableKeepAlive().then(() => {
        const pathArg = unlinkStub.args[0][0];
        const expectedPath =
          '/Users/Jane/Library/LaunchAgents/Bigscreen.keepalive.plist';

        expect(unlinkStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal(expectedPath);
        done();
      });
    });

    it('handles error when trying remove the file', (done) => {
      const unlinkStub = sandbox.stub(fs, 'unlink');

      unlinkStub.callsFake((path, callback) => {
        callback('error');
      });

      darwinKeepAliveProxy.disableKeepAlive().catch((err) => {
        expect(err).to.equal('error');
        done();
      });
    });
  });
});
