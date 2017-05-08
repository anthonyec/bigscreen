const path = require('path');

const { app } = require('electron');

module.exports = {
  CONFIG_PATH: path.join(app.getAppPath(), 'config.yaml'),
};
