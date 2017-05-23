import React from 'react';

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
