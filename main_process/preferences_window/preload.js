const electronSettings = require('electron-settings');

window.PRELOADED_STATE = {
  preferencesScreen: {
    url: electronSettings.get('url'),
  },
};
