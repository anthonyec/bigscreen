import React from 'react';

import { PreferencesScreenContainer } from '../preferences_screen';

export class App extends React.Component {
  render() {
    return (
      <div>
        <PreferencesScreenContainer/>
        { this.props.children }
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.object,
  location: React.PropTypes.object,
};
