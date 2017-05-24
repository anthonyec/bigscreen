import React from 'react';

import { PreferencesScreen } from '../preferences_screen';

import './css/global.css';

export class App extends React.Component {
  render() {
    return (
      <div>
        <PreferencesScreen/>
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.object,
  location: React.PropTypes.object,
};
