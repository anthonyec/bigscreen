/*
 * This will be loaded before other scripts run in the web page.
 * Preload scripts have access to node.js and electron APIs.
 */
const electronSettings = require('electron-settings');

// Make globals from the config file accessible to the web page.
window.__electron = electronSettings.get('globals');
