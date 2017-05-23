import React from 'react';
import { connect } from 'react-redux';

import { Combobox } from './combobox';

import classes from '../core/css/screen.css';

export function PreferencesScreen() {
  return (
    <div className={ classes.screen }>
      <Combobox>
        <option disabled defaultValue>
          Select one
        </option>
        <option value="https://ubs-opinion-wall.com/">
          London
        </option>
        <option value="https://ubs-opinion-wall.com/">
          London
        </option>
        <option value="https://ubs-opinion-wall.com/">
          London
        </option>
      </Combobox>
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
