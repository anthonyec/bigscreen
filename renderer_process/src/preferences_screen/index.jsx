import React from 'react';
import { connect } from 'react-redux';

export function PreferencesScreen() {
  return (
    <div>
      PreferencesScreen
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
