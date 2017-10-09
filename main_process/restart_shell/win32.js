const PowerShell = require('powershell');

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

module.exports = exports = restartWindowsExplorer;
