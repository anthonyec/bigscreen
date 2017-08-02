import { Map, fromJS } from 'immutable';

import {
  POPULATE_PREFERENCES,
  SET_WEB_ADDRESS,
} from './action_creators';

export default function(state = new Map(), action) {
  switch (action.type) {
    case POPULATE_PREFERENCES:
      const { settings } = action.payload;
      return state.merge(fromJS(settings));

    case SET_WEB_ADDRESS:
      return state.setIn(['url'], action.payload.url);

    default:
      return state;
  }
}

