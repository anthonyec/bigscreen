const getPlatformAPI = require('../utils/get_platform_api');
const restartShellWin32 = require('./win32');

const api = getPlatformAPI({
  win32: {
    restartShell: restartShellWin32.restartWindowsExplorer,
  },
});

module.exports = Object.assign(module.exports, api);
