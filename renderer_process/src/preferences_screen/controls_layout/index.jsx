import React from 'react';

export { Control } from './control';

import classes from './controls_layout.css';

export class ControlsLayout extends React.Component {
  render() {
    return (
      <div className={ classes.controlsLayout }>
        { this.props.children }
      </div>
    );
  }
}

ControlsLayout.propTypes = {
  children: React.PropTypes.node,
};
