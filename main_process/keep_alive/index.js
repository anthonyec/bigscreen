const getPlatformAPI = require('../utils/get_platform_api');
const keepAliveDarwin = require('./darwin');

const api = getPlatformAPI({
  'darwin': {
    enableKeepAlive: keepAliveDarwin.enableKeepAlive,
    disableKeepAlive: keepAliveDarwin.disableKeepAlive,
  },
});

console.log(api);

module.exports = Object.assign(module.exports, api);
