/*
 * This will be loaded before other scripts run in the web page.
 * Preload scripts have access to node.js and electron APIs.
 */
const electronSettings = require('electron-settings');

// Merge window globals with the globals inside config.yaml.
Object.assign(window, electronSettings.get('globals'));
