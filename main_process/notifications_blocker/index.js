const getPlatformAPI = require('../utils/get_platform_api');
const blockerWin32 = require('./win32');

const api = getPlatformAPI({
  win32: {
    enableNotificationBlocker: blockerWin32.enableNotificationBlocker,
    disableNotificationBlocker: blockerWin32.disableNotificationBlocker,
  },
});

module.exports = Object.assign(module.exports, api);
