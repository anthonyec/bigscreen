const os = require('os');
const Registry = require('winreg');
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
const WINDOWS7_REGEX = /^6.1/;
const RELEASE_VERSION = os.release();

// Location of the key in the windows registry to toggle the balloon tips in
// windows 7.
const BALLOON_LOCATION =
  '\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced';

// Location of the key in the windows registry to toggle the
// toast notifications in windows 8+.
const PUSH_NOTIFICATIONS_LOCATION =
  '\\SOFTWARE\\Microsoft\\Windows\\CurrentVersion\\PushNotifications';

function booleanToInt(bool) {
  return bool ? 1 : 0;
}

function isWindows7(version) {
  return WINDOWS7_REGEX.test(version);
}

/**
 * Put value into registry to set EnableBalloonTips to 0;
 * @param {boolean} bool True to enable push notifications.
 * @return {promise} Resolves when inserted into registry.
 */
function setPushNotificationsEntry(bool) {
  return new Promise((resolve, reject) => {
    const intValue = booleanToInt(bool);
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: PUSH_NOTIFICATIONS_LOCATION,
    });

    regKey.set('ToastEnabled', 'REG_DWORD', intValue, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
    });
  });
}

/**
 * Put value into registry to set EnableBalloonTips to 0;
 * @param {boolean} bool True to enable balloon tips.
 * @return {promise} Resolves when inserted into registry.
 */
function setBalloonTipsRegistryEntry(bool) {
  return new Promise((resolve, reject) => {
    const intValue = booleanToInt(bool);
    const regKey = new Registry({
      hive: Registry.HKCU,
      key: BALLOON_LOCATION,
    });

    regKey.set('EnableBalloonTips', 'REG_DWORD', intValue, (err) => {
      if (err) {
        return reject(err);
      }

      return resolve();
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
    // Even tried running .bat files and stuff and nope, inconsistent on win10.
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
 * @param {boolean} bool True to enable balloon tips.
 * @return {promise} Resolves after restarting explorer.
 */
function toggleBalloonTips(bool) {
  return module.exports.setBalloonTipsRegistryEntry(bool).then(() => {
    return module.exports.restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

/**
 * Disable WWindows 8+ toast notifications and restart Windows Explorer.
 * @param {boolean} bool True to enable push notifications.
 * @return {promise} Resolves after restarting explorer.
 */
function toggleToastNotifications(bool) {
  return module.exports.setPushNotificationsEntry(bool).then(() => {
    return module.exports.restartWindowsExplorer();
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
  if (module.exports.isWindows7(RELEASE_VERSION)) {
    return module.exports.toggleBalloonTips(false);
  }

  return module.exports.toggleToastNotifications(false);
}

/**
 * Stop blocking notifications. These will be balloon tooltips on Win7 and
 * toasts on Win8+.
 * @return {promise} Resolves after restarting explorer.
 */
function disableNotificationBlocker() {
  if (module.exports.isWindows7(RELEASE_VERSION)) {
    return module.exports.toggleBalloonTips(true);
  }

  return module.exports.toggleToastNotifications(true);
}

module.exports = {
  booleanToInt,
  isWindows7,
  setPushNotificationsEntry,
  setBalloonTipsRegistryEntry,
  restartWindowsExplorer,
  toggleBalloonTips,
  toggleToastNotifications,

  enableNotificationBlocker,
  disableNotificationBlocker,
};
