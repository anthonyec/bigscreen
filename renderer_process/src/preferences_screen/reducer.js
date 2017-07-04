import { Map } from 'immutable';
import { ipcRenderer } from 'electron';

import {
  UPDATE_WEB_ADDRESS,
} from './action_creators';

export const updateWebAddress = (url) => {
  ipcRenderer.send(UPDATE_WEB_ADDRESS, { url });
};

export default function(state = new Map(), action) {
  switch (action.type) {
    case UPDATE_WEB_ADDRESS:
      updateWebAddress(action.url);
      return state;

    default:
      return state;
  }
}

