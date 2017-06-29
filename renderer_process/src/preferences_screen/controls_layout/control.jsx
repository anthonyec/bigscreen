import React from 'react';

import uid from 'utils/uid';

import classes from './control.css';

export class Control extends React.Component {
  constructor(props) {
    super(props);

    // ID is generated here instead of render to avoid unnecessarily creation.
    this.id = uid('control');
  }

  getLabel() {
    const label = `${this.props.label}:`;
    return this.props.label ? label : '';
  }

  getInputControl() {
    return React.cloneElement(this.props.children, {
      id: this.id,
    });
  }

  render() {
    return (
      <div className={ classes.control }>
        <label className={ classes.label } htmlFor={ this.id }>
          { this.getLabel() }
        </label>
        <div className={ classes.input }>
          { this.getInputControl() }
        </div>
      </div>
    );
  }
}

Control.propTypes = {
  label: React.PropTypes.string,
  children: React.PropTypes.element,
};
