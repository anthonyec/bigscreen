const path = require('path');

const { app } = require('electron');

const HOME_PATH = app.getPath('home');
const LAUNCH_AGENTS_PATH = path.join(HOME_PATH, 'Library', 'LaunchAgents');

module.exports = {
  CONFIG_PATH: path.join(app.getAppPath(), 'config.yaml'),
  EXE_PATH: app.getPath('exe'),
  HOME_PATH,
  LAUNCH_AGENTS_PATH,
  FALLBACK_PATH: path.join(app.getAppPath(), 'resources', 'fallback',
    'index.html'),
};
