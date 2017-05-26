import React from 'react';

import { ControlsLayout, Control } from './controls_layout';
import { Actions } from './actions';
import { Combobox } from './combobox';
import { Dropdown } from './dropdown';
import { Checkbox } from './checkbox';
import { Button } from './button';

import classes from '../core/css/screen.css';

export function PreferencesScreen() {
  return (
    <div className={ classes.screen }>
      <ControlsLayout>
        <Control label="Web address">
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
        </Control>

        <Control label="Screen">
          <Dropdown defaultValue="Screen 1">
            <option>Screen 1</option>
            <option>Screen 2</option>
            <option>Both</option>
          </Dropdown>
        </Control>

        <Control>
          <Checkbox label="Start a login"/>
        </Control>
      </ControlsLayout>

      <Actions>
        <Button>
          Start
        </Button>
      </Actions>
    </div>
  );
}
