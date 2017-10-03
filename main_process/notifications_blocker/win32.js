const os = require('os');
const regedit = require('regedit');
const PowerShell = require('powershell');

/*
 https://msdn.microsoft.com/en-us/library/windows/desktop/ms724834(v=vs.85).aspx

      Operating system      dwMajorVersion   dwMinorVersion
  ------------------------ ---------------- ----------------
   Windows 10                           10                0
   Windows Server 2016                  10                0
   Windows 8.1                           6                3
   Windows Server 2012 R2                6                3
   Windows 8                             6                2
   Windows Server 2012                   6                2
   Windows 7                             6                1
*/
const WINDOWS7_REGEX = /^6.1/g;
const RELEASE_VERSION = os.release();
const BALLOON_LOCATION = 'HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced'; // eslint-disable-line

// To swap out windows 8-10 toast notification for balloon.
const PUSH_NOTIFICATIONS_LOCATION = 'HKCU\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications'; // eslint-disable-line

/**
 * Get registry key and value structure for EnableBalloonTips.
 * @param {integer} value Integer value boolean.
 * @return {object} Options for regedit.
 */
function getBalloonEntryValue(value) {
  return {
    [BALLOON_LOCATION]: {
      EnableBalloonTips: {
        value,
        type: 'REG_DWORD', // `REG_DWORD` is a 32bit number.
      },
    },
  };
}

/**
 * Get registry key and value structure for ToastEnabled.
 * @param {integer} value Integer value boolean.
 * @return {object} Options for regedit.
 */
function getPushNotificationsValue(value) {
  return {
    [PUSH_NOTIFICATIONS_LOCATION]: {
      ToastEnabled: {
        value,
        type: 'REG_DWORD', // `REG_DWORD` is a 32bit number.
      },
    },
  };
}

/**
 * Put value into registry to set ToastEnabled to 0;
 * @return {promise} Resolves when inserted into registry.
 */
function setPushNotificationsEntryToFalse() {
  return new Promise((resolve, reject) => {
    const value = getPushNotificationsValue(0);

    regedit.putValue(value, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

/**
 * Put value into registry to set ToastEnabled to 1;
 * @return {promise} Resolves when inserted into registry.
 */
function setPushNotificationsEntryToTrue() {
  return new Promise((resolve, reject) => {
    const value = getPushNotificationsValue(1);

    regedit.putValue(value, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

/**
 * Put value into registry to set EnableBalloonTips to 1;
 * @return {promise} Resolves when inserted into registry.
 */
function setBalloonTipsRegistryEntryToTrue() {
  return new Promise((resolve, reject) => {
    const value = getBalloonEntryValue(1);

    regedit.putValue(value, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

/**
 * Put value into registry to set EnableBalloonTips to 0;
 * @return {promise} Resolves when inserted into registry.
 */
function setBalloonTipsRegistryEntryToFalse() {
  return new Promise((resolve, reject) => {
    const value = getBalloonEntryValue(0);

    regedit.putValue(value, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

/**
 * Restart Windows Explorer for any registry changes to take affect.
 * @return {promise} Resolves once PowerShell script has ended.
 */
function restartWindowsExplorer() {
  return new Promise((resolve, reject) => {
    // Use powershell instead of CMD.exe because on windows 10, explorer.exe
    // does not fully restart when calling it from Electron.
    // Even tried running .bat files and stuff and nope, incositent on win10.
    const ps = new PowerShell('Stop-Process -ProcessName Explorer');

    ps.on('error', (err) => {
      reject(err);
    });

    ps.on('end', () => {
      resolve();
    });
  });
}

/**
 * Disable Windows 7's balloon tooltips and restart Windows Explorer.
 * @return {promise} Resolves after restarting explorer.
 */
function disableBalloonTips() {
  // https://www.howtogeek.com/howto/windows-vista/
  // disable-all-notification-balloons-in-windows-vista/

  // Create the registry entry "EnableBalloonTips" with value 0 (int).
  // Restart explorer for the changes to take effect.
  return setBalloonTipsRegistryEntryToFalse().then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

/**
 * Enable Windows 7's balloon tooltips and restart Windows Explorer.
 * @return {promise} Resolves after restarting explorer.
 */
function enableBalloonTips() {
  return setBalloonTipsRegistryEntryToTrue().then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

/**
 * Disable WWindows 8+ toast notifications and restart Windows Explorer.
 * @return {promise} Resolves after restarting explorer.
 */
function disableToastNotifications() {
  return setPushNotificationsEntryToFalse().then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

/**
 * Enable WWindows 8+ toast notifications and restart Windows Explorer.
 * @return {promise} Resolves after restarting explorer.
 */
function enableToastNotifications() {
  return setPushNotificationsEntryToTrue().then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

/**
 * Start blocking notifications. These will be balloon tooltips on Win7 and
 * toasts on Win8+.
 * @return {promise} Resolves after restarting explorer.
 */
function enableNotificationBlocker() {
  if (RELEASE_VERSION.match(WINDOWS7_REGEX)) {
    return disableBalloonTips();
  }
  return disableToastNotifications();
}

/**
 * Stop blocking notifications. These will be balloon tooltips on Win7 and
 * toasts on Win8+.
 * @return {promise} Resolves after restarting explorer.
 */
function disableNotificationBlocker() {
  // If windows 7 then disable balloon notifications,
  // else assume this is Windows 10. Bigscreen should only run on Windows 7+.
  if (RELEASE_VERSION.match(WINDOWS7_REGEX)) {
    return enableBalloonTips();
  }
  return enableToastNotifications();
}

module.exports = {
  getBalloonEntryValue,
  getPushNotificationsValue,
  setBalloonTipsRegistryEntryToTrue,
  setBalloonTipsRegistryEntryToFalse,
  restartWindowsExplorer,
  disableBalloonTips,
  enableBalloonTips,
  disableToastNotifications,
  enableToastNotifications,

  enableNotificationBlocker,
  disableNotificationBlocker,
};
