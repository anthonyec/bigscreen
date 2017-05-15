import { combineReducers } from 'redux';

import myModule from '../my_module/reducer';

export default combineReducers({
  // you can combine all your other reducers under a single namespace like so
  myModule,
});
