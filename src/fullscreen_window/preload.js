const electronSettings = require('electron-settings');

// Merge window globals with the globals inside config.yaml.
Object.assign(window, electronSettings.get('globals'));
