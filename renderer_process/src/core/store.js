import { applyMiddleware, createStore, compose } from 'redux';
import thunk from 'redux-thunk';

import reducer from './reducer';

export const makeStore = () => {
  // To add redux-devtools for extensions
  // eslint-disable-next-line max-len, no-underscore-dangle
  const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

  const middleware = [thunk];

  return createStore(reducer, composeEnhancers(
    applyMiddleware(...middleware)
  ));
};
