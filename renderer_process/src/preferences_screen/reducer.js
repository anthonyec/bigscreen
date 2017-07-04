import { Map } from 'immutable';

import {
  SET_ELECTRON_SETTING,
  SET_WEB_ADDRESS,
} from './action_creators';

export default function(state = new Map(), action) {
  switch (action.type) {
    case SET_ELECTRON_SETTING:
      const { key, value } = action.payload;
      return state.set(key, value);

    case SET_WEB_ADDRESS:
      return state.set({ 'url': action.payload.url });

    default:
      return state;
  }
}

