import React from 'react';
import { connect } from 'react-redux';

import { Textfield } from './textfield';

import classes from '../core/css/screen.css';

export function PreferencesScreen() {
  return (
    <div className={ classes.screen }>
      PreferencesScreen

      <Textfield/>
    </div>
  );
}

PreferencesScreen.propTypes = {};

export function mapStateToProps() { // state
  return {};
}

export const PreferencesScreenContainer = connect(
  mapStateToProps
)(PreferencesScreen);
