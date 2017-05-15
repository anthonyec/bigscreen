import React from 'react';
import { Router, Route, Link, hashHistory } from 'react-router';
import { Provider } from 'react-redux';
import ReactDOM from 'react-dom';

import { App } from './app';
import { makeStore } from './store';

export default function init() {
  const store = makeStore(hashHistory);

      // <Route path="/page" component={MyComponentContainer} />
  const routes = (
    <Route path="/" component={App}>
    </Route>
  );

  const app = (
    <Provider store={store}>
      <Router routes={routes} history={hashHistory} />
    </Provider>
  );

  ReactDOM.render(app, document.getElementById('app'));
}
