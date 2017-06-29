import React from 'react';
import { connect } from 'react-redux';

import noop from 'utils/noop';
import { ControlsLayout, Control } from './controls_layout';
import { Actions } from './actions';
import { Combobox } from './combobox';
import { Dropdown } from './dropdown';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { startFullscreen } from './action_creators';

import classes from '../core/css/screen.css';

export class PreferencesScreen extends React.Component {
  render() {
    return (
      <div className={ classes.screen }>
        <ControlsLayout>
          <Control label="Web address">
            <Combobox>
              <option value="">
                Custom
              </option>
              <option value="https://google.com/">
                Google
              </option>
              <option value="https://yahoo.com/">
                Yahoo
              </option>
              <option value="https://ask.com/">
                Ask
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
          <Button onClick={this.props.startFullscreen}>
            Start
          </Button>
        </Actions>
      </div>
    );
  }
}

PreferencesScreen.propTypes = {
  startFullscreen: React.PropTypes.func,
};

PreferencesScreen.defaultProps = {
  startFullscreen: noop,
};

export function mapStateToProps(state) {  // ownProps
  return state;
}

export default connect(
  mapStateToProps, { startFullscreen }
)(PreferencesScreen);
