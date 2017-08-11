const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');
const regedit = require('regedit');

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
const LEGACY_BALLOON_LOCATION = 'HKCU\\SOFTWARE\\Policies\\Microsoft\\Windows\\Explorer'; // eslint-disable-line

function getBalloonEntryValue(value) {
  return {
    [BALLOON_LOCATION]: {
      'EnableBalloonTips': {
        value,
        type: 'REG_DWORD', // `REG_DWORD` is a 32bit number.
      },
    },
  };
}

function getLegacyEntryValue(value) {
  return {
    [LEGACY_BALLOON_LOCATION]: {
      'EnableLegacyBalloonNotifications': {
        value,
        type: 'REG_DWORD', // `REG_DWORD` is a 32bit number.
      },
    },
  };
}

function setBalloonTipsRegistryEntryToTrue() {
  return new Promise((resolve, reject) => {
    const value = getBalloonEntryValue(1);

    regedit.putValue(BALLOON_TIPS_ENTRY, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

function setBalloonTipsRegistryEntryToFalse() {
  return new Promise((resolve, reject) => {
    const value = getBalloonEntryValue(0);

    regedit.putValue(BALLOON_TIPS_ENTRY, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

function restartWindowsExplorer() {
  return new Promise((resolve, reject) => {
    const batFilePath = path.join(__dirname, 'restart_explorer.bat');

    exec(batFilePath, (err) => {
      if (err) {
        reject(err);
      }

      resolve();
    });
  });
}

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

function enableBalloonTips() {
  return setBalloonTipsRegistryEntryToTrue().then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

function disableToastNotifications() {
  return setLegacyBalloonEntryToTrue().then(() => {
    return setBalloonTipsRegistryEntryToFalse();
  }).then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

function enableToastNotifications() {
  return setLegacyBalloonEntryToFalse().then(() => {
    return setBalloonTipsRegistryEntryToTrue();
  }).then(() => {
    return restartWindowsExplorer();
  }).catch((err) => {
    throw err;
  });
}

function enableNotificationBlocker() {
  if (RELEASE_VERSION.match(WINDOWS7_REGEX)) {
    disableBalloonTips();
  } else {
    disableToastNotifications();
  }
}

function disableNotificationBlocker() {
  // If windows 7 then disable balloon notifications,
  // else assume this is Windows 10. Bigscreen should only run on Windows 7+.
  if (RELEASE_VERSION.match(WINDOWS7_REGEX)) {
    enableBalloonTips();
  } else {
    disableToastNotifications();
  }
}

module.exports = {
  getBalloonEntryValue,
  getLegacyEntryValue,
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
