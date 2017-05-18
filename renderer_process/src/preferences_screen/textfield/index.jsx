import React from 'react';

import classes from './textfield.css';

export function Textfield() {
  return (
    <div className={ classes.textfield }>
      <input className={ classes.input } type="text"/>
    </div>
  );
}
