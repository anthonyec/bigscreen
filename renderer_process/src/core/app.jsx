import React from 'react';

import { MyComponentContainer } from '../my_module';

import './css/global.css';

export class App extends React.Component {
  render() {
    return (
      <div>
        <h1>App</h1>
        {this.props.children}
      </div>
    );
  }
}

App.propTypes = {
  children: React.PropTypes.object,
  location: React.PropTypes.object,
};
