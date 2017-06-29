import React from 'react';

import noop from 'utils/noop';

import classes from './button.css';

export const Button = (props) => {
  return (
    <button className={classes.button} onClick={props.onClick}>
      {props.children}
    </button>
  );
};

Button.defaultProps = {
  onClick: noop,
};

Button.propTypes = {
  onClick: React.PropTypes.func,
  children: React.PropTypes.node,
};
