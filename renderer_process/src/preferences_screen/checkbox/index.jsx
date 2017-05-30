import React from 'react';

import uid from './src/core/utils/uid';

import classes from './checkbox.css';
import tick from './tick.svg';

export class Checkbox extends React.Component {
  constructor(props) {
    super(props);
    this.id = uid('checkbox');
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

  render() {
    return (
      <div className={ classes.checkbox }>
        <div className={ classes.checkboxBox }>
          <input className={ classes.input } type="checkbox" id={ this.id }/>
          <div className={ classes.check }>
            <img className={ classes.tick } src={ tick }/>
          </div>
        </div>
        { this.getLabel() }
      </div>
    );
  }
}

Checkbox.propTypes = {
  label: React.PropTypes.string,
};

