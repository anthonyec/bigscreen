import { Map } from 'immutable';
import { ipcRenderer } from 'electron';

import {
  START_FULLSCREEN,
  UPDATE_WEB_ADDRESS,
} from './action_creators';

export const startFullscreen = () => {
  ipcRenderer.send('start_fullscreen');
};

export const updateWebAddress = (url) => {
  ipcRenderer.send(UPDATE_WEB_ADDRESS, { url });
};

export default function(state = new Map(), action) {
  switch (action.type) {
    case START_FULLSCREEN:
      startFullscreen();
      return state;

    case UPDATE_WEB_ADDRESS:
      updateWebAddress(action.url);
      return state;

    default:
      return state;
  }
}

