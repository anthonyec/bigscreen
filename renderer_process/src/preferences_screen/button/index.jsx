import React from 'react';

import classes from './button.css';

export class Button extends React.Component {
  render() {
    return (
      <button className={ classes.button }>
        { this.props.children }
      </button>
    );
  }
}

Button.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
    React.PropTypes.string,
  ]),
};
