const fs = require('fs');

const { expect } = require('chai');
const sinon = require('sinon');
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

      mkdirStub.callsFake((filePath, callback) => {
        callback();
      });

      return darwinKeepAliveProxy.createLaunchAgentsDir().then(() => {
        const pathArg = mkdirStub.args[0][0];

        expect(mkdirStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal('/Users/Jane/Library/LaunchAgents');
      });
    });

    it('handles error creating directory', () => {
      const mkdirStub = sandbox.stub(fs, 'mkdir');

      mkdirStub.callsFake((filePath, callback) => {
        callback('error');
      });

      return darwinKeepAliveProxy.createLaunchAgentsDir().catch(() => {
        expect(mkdirStub.calledOnce).to.equal(true);
      });
    });
  });

  describe('ensureLaunchAgentsDirExists', () => {
    it('resolves if LaunchAgents directory exists', () => {
      const accessStub = sandbox.stub(fs, 'access');

      accessStub.callsFake((filePath, mode, callback) => {
        callback();
      });

      return darwinKeepAliveProxy.ensureLaunchAgentsDirExists().then(() => {
        const pathArg = accessStub.args[0][0];
        const modeArg = accessStub.args[0][1];

        expect(pathArg).to.equal('/Users/Jane/Library/LaunchAgents');
        expect(modeArg).to.equal(fs.constants.W_OK);
      });
    });

    it('calls createLaunchAgentsDir if directory does not exist', () => {
      const accessStub = sandbox.stub(fs, 'access');
      const createLaunchAgentsDirStub = sandbox.stub(
        darwinKeepAliveProxy,
        'createLaunchAgentsDir'
      );

      createLaunchAgentsDirStub.returns(Promise.resolve());

      accessStub.callsFake((filePath, mode, callback) => {
        callback({ code: 'ENOENT' });
      });

      return darwinKeepAliveProxy.ensureLaunchAgentsDirExists().then(() => {
        expect(createLaunchAgentsDirStub.calledOnce).to.equal(true);
      });
    });

    it('handles any other error that is not ENOENT', () => {
      const accessStub = sandbox.stub(fs, 'access');
      const createLaunchAgentsDirStub = sandbox.stub(
        darwinKeepAliveProxy,
        'createLaunchAgentsDir'
      );

      createLaunchAgentsDirStub.returns(Promise.resolve());

      accessStub.callsFake((filePath, mode, callback) => {
        callback({ code: 'EACCESS' });
      });

      return darwinKeepAliveProxy.ensureLaunchAgentsDirExists().catch((err) => {
        expect(err).to.eql({ code: 'EACCESS' });
        expect(createLaunchAgentsDirStub.calledOnce).to.equal(false);
      });
    });
  });

  describe('enableKeepAlive', () => {
    it('calls ensureLaunchAgentsDirExists then calls writeFile', () => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const plistBuildStub = sandbox.stub(plist, 'build');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((filePath, file, callback) => {
        callback();
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.resolve());

      return darwinKeepAliveProxy.enableKeepAlive().then(() => {
        const pathArg = writeFileStub.args[0][0];
        const expectedPath =
          '/Users/Jane/Library/LaunchAgents/Bigscreen.keepalive.plist';

        expect(writeFileStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal(expectedPath);
        expect(plistBuildStub.calledOnce).to.equal(true);
        expect(plistBuildStub.args[0][0]).to.eql(expectedPlistFileObject);
      });
    });

    it('handles error when ensureLaunchAgentsDirExists fails', () => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((filePath, file, callback) => {
        callback();
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.reject());

      return darwinKeepAliveProxy.enableKeepAlive().catch(() => {
        expect(writeFileStub.calledOnce).to.equal(false);
      });
    });

    it('handles error when it fails to write the file', () => {
      const writeFileStub = sandbox.stub(fs, 'writeFile');
      const ensureLaunchAgentsDirExistsStub = sandbox.stub(
        darwinKeepAliveProxy,
        'ensureLaunchAgentsDirExists'
      );

      writeFileStub.callsFake((filePath, file, callback) => {
        callback('error');
      });

      ensureLaunchAgentsDirExistsStub.returns(Promise.resolve());

      return darwinKeepAliveProxy.enableKeepAlive().catch((err) => {
        expect(writeFileStub.calledOnce).to.equal(true);
        expect(err).to.equal('error');
      });
    });
  });

  describe('disableKeepAlive', () => {
    it('calls unlink', () => {
      const unlinkStub = sandbox.stub(fs, 'unlink');

      unlinkStub.callsFake((filePath, callback) => {
        callback();
      });

      return darwinKeepAliveProxy.disableKeepAlive().then(() => {
        const pathArg = unlinkStub.args[0][0];
        const expectedPath =
          '/Users/Jane/Library/LaunchAgents/Bigscreen.keepalive.plist';

        expect(unlinkStub.calledOnce).to.equal(true);
        expect(pathArg).to.equal(expectedPath);
      });
    });

    it('handles error when trying remove the file', () => {
      const unlinkStub = sandbox.stub(fs, 'unlink');

      unlinkStub.callsFake((filePath, callback) => {
        callback('error');
      });

      return darwinKeepAliveProxy.disableKeepAlive().catch((err) => {
        expect(err).to.equal('error');
      });
    });
  });
});
