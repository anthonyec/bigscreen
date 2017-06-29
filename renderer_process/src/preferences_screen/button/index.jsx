import React from 'react';

import classes from './button.css';

export const Button = (props) => {
  return (
    <button className={classes.button}>
      {props.children}
    </button>
  );
};

Button.propTypes = {
  children: React.PropTypes.none,
};
