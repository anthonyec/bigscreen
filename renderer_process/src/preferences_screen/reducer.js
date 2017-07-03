import { Map } from 'immutable';
import { ipcRenderer } from 'electron';

import {
  START_FULLSCREEN,
} from './action_creators';

export const startFullscreen = () => {
  ipcRenderer.send(START_FULLSCREEN);
};

export default function(state = new Map(), action) {
  switch (action.type) {
    case START_FULLSCREEN:
      startFullscreen();
      return state;
    default:
      return state;
  }
}

