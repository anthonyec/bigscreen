import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';
import { fromJS } from 'immutable';

import reducer from './reducer';
import { electronSettingsMiddleware } from './middleware/electron_settings';

export const makeStore = () => {
  // To add redux-devtools for extensions
  // eslint-disable-next-line max-len, no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const middleware = [thunk, electronSettingsMiddleware];
  return createStore(reducer, composeEnhancers(
    applyMiddleware(...middleware)
  ));
};
