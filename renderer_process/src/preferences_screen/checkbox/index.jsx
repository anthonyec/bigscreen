import React from 'react';

import classes from './checkbox.css';
import tick from './tick.svg';

export class Checkbox extends React.Component {
  getLabel() {
    let label;

    if (this.props.label) {
      label = (
        <label className={ classes.label } htmlFor="input">
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
          <input className={ classes.input } type="checkbox" id="input"/>
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

