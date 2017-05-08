const { ipcRenderer } = require('electron');

const electronSettings = require('electron-settings');

/**
 * Clone a object and wrap each method with a function that calls an IPC event.
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

// This contains some things that eslint aint gonna like, for example
// unexpected dangling and reassining native globals, but yeah.
process.once('loaded', () => {
  // Replace console object with cloned version containing wrapped methods.
  console = wrapMethodsWithIPCEvent(console, 'window_log'); // eslint-disable-line

  // Make globals from the config file accessible to the web page.
  window.__electron = electronSettings.get('globals'); // eslint-disable-line
});

module.exports = {
  wrapMethodsWithIPCEvent,
};
