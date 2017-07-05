import React from 'react';

import uid from 'utils/uid';
import noop from 'utils/noop';

import classes from './checkbox.css';
import tick from './tick.svg';

export class Checkbox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      isChecked: props.isChecked,
    };

    this.id = uid('checkbox');
    this.handleChange = this.handleChange.bind(this);
  }

  getLabel() {
    let label;

    if (this.props.label) {
      label = (
        <label className={ classes.label } htmlFor={ this.id }>
          Start at login
        </label>
      );
    }

    return label;
  }

  handleChange() {
    const isChecked = !this.state.isChecked;

    this.setState({ isChecked });
    this.props.onChange(isChecked);
  }

  render() {
    return (
      <div className={ classes.checkbox }>
        <div className={ classes.checkboxBox }>
          <input
            className={ classes.input }
            type="checkbox"
            ref="checkbox"
            id={ this.id }
            onChange={this.handleChange}
          />
          <div className={ classes.check }>
            <img className={ classes.tick } src={ tick }/>
          </div>
        </div>
        { this.getLabel() }
      </div>
    );
  }
}

Checkbox.defaultProps = {
  isChecked: false,
  onChange: noop,
};

Checkbox.propTypes = {
  label: React.PropTypes.string,
  isChecked: React.PropTypes.bool,
  onChange: React.PropTypes.func,
};

