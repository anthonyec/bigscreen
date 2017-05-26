import React from 'react';

import classes from './control.css';

export class Control extends React.Component {
  getLabel() {
    const label = `${this.props.label}:`;
    return this.props.label ? label : '';
  }

  render() {
    return (
      <div className={ classes.control }>
        <div className={ classes.label }>
          { this.getLabel() }
        </div>
        <div className={ classes.input }>
          { this.props.children }
        </div>
      </div>
    );
  }
}

Control.propTypes = {
  label: React.PropTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
};
