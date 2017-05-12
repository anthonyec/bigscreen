const path = require('path');

const { app } = require('electron');

module.exports = {
  CONFIG_PATH: path.join(app.getAppPath(), 'config.yaml'),
  FALLBACK_PATH: path.join(app.getAppPath(), 'resources', 'fallback',
    'index.html'),
};
