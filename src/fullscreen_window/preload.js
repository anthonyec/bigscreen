const { ipcRenderer } = require('electron');
const electronSettings = require('electron-settings');

/**
 * Clone a object and wrap each of its methods with a function that calls
 * a IPC event.
 * @param {object} objectToCopy Object with methods to wrap.
 * @param {string} eventName Name of the event to call via IPC Renderer.
 * @returns {object} wrappedObj Clone of object with methods wrapped
 * in functions.
 */
function wrapMethodsWithIPCEvent(objectToCopy, eventName) {
  const methods = Object.keys(objectToCopy);

  const wrappedMethods = methods.reduce((wrappedObj, method) => {
    const orginalMethod = objectToCopy[method];

    const wrappedMethod = function() { // eslint-disable-line
      ipcRenderer.send(eventName, { method, arguments });
      orginalMethod.apply(wrappedMethod, arguments);
    };

    wrappedObj[method] = wrappedMethod;
    return wrappedObj;
  }, {});

  return wrappedMethods;
}

process.once('loaded', () => {
  // Replace console object with cloned version containing wrapped methods.
  console = wrapMethodsWithIPCEvent(console, 'window_log'); // eslint-disable-line


  // Assign globals from config.yaml to namespaced object in window.
  window.__electron = electronSettings.get('globals');
});

module.exports = {
  wrapMethodsWithIPCEvent,
}
