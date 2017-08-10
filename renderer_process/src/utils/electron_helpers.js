import { ipcRenderer, remote } from 'electron';

const electronSettings = remote.require('electron-settings');

export const getSettings = () => {
  return {
    url: electronSettings.get('url'),
    autolaunch: electronSettings.get('autolaunch', false),
  };
};

export const startFullscreen = () => {
  ipcRenderer.send('START_FULLSCREEN');
};

export const setAutoLaunch = (value) => {
  const eventName = value ? 'ENABLE_AUTO_LAUNCH' : 'DISABLE_AUTO_LAUNCH';
  ipcRenderer.send(eventName);
};
