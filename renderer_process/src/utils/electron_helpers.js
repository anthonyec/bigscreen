import { ipcRenderer, remote } from 'electron';

const electronSettings = remote.require('electron-settings');

export const getSettings = () => {
  return {
    url: electronSettings.get('url'),
  };
};

export const startFullscreen = () => {
  ipcRenderer.send('START_FULLSCREEN');
};
