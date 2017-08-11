const { exec, spawn } = require('child_process');
const os = require('os');
const path = require('path');
const regedit = require('regedit');

const RELEASE_VERSION = os.release();

// Windows7 = 6.1.x
const WINDOWS7_REGEX = /^6.1/g;

if (RELEASE_VERSION.match(WINDOWS7_REGEX)) {
  console.log('WOW WINDOWS 7 GO YOU');
}


const BALLOON_LOCATION = "HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Explorer\\Advanced";

// Process of disabling tooltip balloons on Windows:
// - Create the registry entry "EnableBalloonTips" with value 0.
// - Restart explorer for the changes to take effect.
// - `taskkill /f /im explorer.exe`.
// - `start explorer.exe`.

const BALLOON_TIPS_ENTRY = {
  [BALLOON_LOCATION]: {
    'EnableBalloonTips': {
      value: 0,
      type: 'REG_DWORD', // `REG_DWORD` is a 32bit number.
    },
  },
};

function createBalloonTipsRegistryEntry() {
  return new Promise((resolve, reject) => {
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
    const batFilePath = path.join(__dirname, 'main_process', 'notifications_blocker', 'restart_explorer.bat');

    const spawned = exec(batFilePath);

    spawned.on('data', (data) => {
      console.log(data);
    });

    // spawned.kill();


    // const p = exec(batFilePath, (err) => {
    //   if (err) {
    //     reject(err);
    //   }

    //   resolve();
    // });
  });
}

// https://www.howtogeek.com/howto/windows-vista/disable-all-notification-balloons-in-windows-vista/
function disableBalloonTips() {
  createBalloonTipsRegistryEntry().then(() => {
    return restartWindowsExplorer();
  }).then(() => {
    console.log('Explorer process finished');
  }).catch((err) => {
    throw err;
  });
}

disableBalloonTips();
enableBalloonTips();
