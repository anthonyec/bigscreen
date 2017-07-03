import React from 'react';

import classes from './actions.css';

export const Actions = (props) => {
  return (
    <div className={classes.actions}>
      {props.children}
    </div>
  );
};

Actions.propTypes = {
  children: React.PropTypes.node,
};
