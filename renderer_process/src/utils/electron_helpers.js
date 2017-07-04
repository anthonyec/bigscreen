import { ipcRenderer } from 'electron';

export const getSettings = () => {
  return {};
};

export const startFullscreen = () => {
  ipcRenderer.send('START_FULLSCREEN');
};
