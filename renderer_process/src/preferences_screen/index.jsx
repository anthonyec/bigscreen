import React from 'react';
import { connect } from 'react-redux';

import noop from 'utils/noop';
import { ControlsLayout, Control } from './controls_layout';
import { Actions } from './actions';
import { Combobox } from './combobox';
import { Dropdown } from './dropdown';
import { Checkbox } from './checkbox';
import { Button } from './button';
import {
  setWebAddress,
} from './action_creators';
import { startFullscreen } from '../utils/electron_helpers';
import urlWithProtocol from '../utils/url_with_protocol';

import classes from '../core/css/screen.css';

export class PreferencesScreen extends React.Component {
  handleWebAddressOnChange(evt) {
    this.props.setWebAddress(evt.target.value);
  }

  handleWebAddressOnBlur(value) {
    this.props.setWebAddress(value);
  }

  render() {
    return (
      <div className={ classes.screen }>
        <ControlsLayout>
          <Control label="Web address">
            <Combobox
              value={this.props.url}
              onChange={this.handleWebAddressOnChange.bind(this)}
              onBlur={this.handleWebAddressOnBlur.bind(this)}
              onBlurFormatter={urlWithProtocol}
            >
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
          <Button onClick={startFullscreen}>
            Start
          </Button>
        </Actions>
      </div>
    );
  }
}

PreferencesScreen.propTypes = {
  setWebAddress: React.PropTypes.func,
  url: React.PropTypes.string,
};

PreferencesScreen.defaultProps = {
  setWebAddress: noop,
};

export function mapStateToProps(state) {  // ownProps
  const preferencesScreen = state.get('preferences');

  return {
    url: preferencesScreen.get('url', ''),
  };
}

export default connect(
  mapStateToProps,
  { setWebAddress }
)(PreferencesScreen);
