import React from 'react';

import { Combobox } from './combobox';

import classes from '../core/css/screen.css';

export function PreferencesScreen() {
  return (
    <div className={ classes.screen }>
      <Combobox>
        <option value="">
          Custom
        </option>
        <option value="https://bsc.ubs-opinion-wall.com/">
          Best of Switzerland Conference
        </option>
        <option value="https://gcc.ubs-opinion-wall.com/">
          Greater China Conference
        </option>
        <option value="https://ubs-opinion-wall.com/">
          London
        </option>
      </Combobox>
    </div>
  );
}
