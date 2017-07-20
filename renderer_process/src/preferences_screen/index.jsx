import React from 'react';
import { connect } from 'react-redux';

import noop from 'utils/noop';
import { ControlsLayout, Control } from './controls_layout';
import { Actions } from './actions';
import { Checkbox } from './checkbox';
import { Button } from './button';
import { Textfield } from './textfield';
import {
  setWebAddress,
  setStartAtLogin,
} from './action_creators';
import {
  startFullscreen,
  setAutoLaunch,
} from '../utils/electron_helpers';
import urlWithProtocol from '../utils/url_with_protocol';

import classes from '../core/css/screen.css';

export class PreferencesScreen extends React.Component {
  handleWebAddressOnChange(evt) {
    this.props.setWebAddress(evt.target.value);
  }

  handleWebAddressOnBlur(value) {
    this.props.setWebAddress(value);
  }

  handleOnStartAtLoginChange(value) {
    setAutoLaunch(value);
    this.props.setStartAtLogin(value);
  }

  render() {
    return (
      <div className={ classes.screen }>
        <ControlsLayout>
          <Control label="Web address">
            <Textfield
              value={this.props.url}
              onChange={this.handleWebAddressOnChange.bind(this)}
              onBlur={this.handleWebAddressOnBlur.bind(this)}
              onBlurFormatter={urlWithProtocol}
            />
          </Control>

          <Control>
            <Checkbox
              label="Start at login"
              isChecked={this.props.autolaunch}
              onChange={this.handleOnStartAtLoginChange.bind(this)}
            />
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
  setStartAtLogin: React.PropTypes.func,
  url: React.PropTypes.string,
  autolaunch: React.PropTypes.bool,
};

PreferencesScreen.defaultProps = {
  setWebAddress: noop,
  setStartAtLogin: noop,
};

export function mapStateToProps(state) {  // ownProps
  const preferencesScreen = state.get('preferences');

  return {
    url: preferencesScreen.get('url', ''),
    autolaunch: preferencesScreen.get('autolaunch', false),
  };
}

export default connect(
  mapStateToProps,
  { setWebAddress, setStartAtLogin }
)(PreferencesScreen);
