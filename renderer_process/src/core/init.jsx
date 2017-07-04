import React from 'react';
import { Router, Route, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';

import { App } from './app';
import { makeStore } from './store';

// import { getSettings } from 'utils';

import {
  populatePreferences,
} from '../preferences_screen/action_creators';

export default function init() {
  const store = makeStore(hashHistory);

  // Dispatch inital action to populate the store with electron settings.
  populatePreferences()(store.dispatch);

  const routes = (
    <Route path="/" component={App} />
  );

  const app = (
    <Provider store={store}>
      <Router routes={routes} history={hashHistory} />
    </Provider>
  );

  ReactDOM.render(app, document.getElementById('app'));
}
