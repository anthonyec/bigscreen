import React from 'react';
import { connect } from 'react-redux';

import { baseColor } from '../core/css/vars.css';
import classes from './my_module.css';

export function MyComponent() {
  // example importing the css classes via css-loader
  // and importing a variable from the .css files via
  // css-loader and postcss-simple-vars
  return (
    <div className={classes.wrap}>
      Hello World! The base color is {baseColor}
    </div>
  );
}

MyComponent.propTypes = {};

export function mapStateToProps() { // state
  return {};
}

export const MyComponentContainer = connect(
  mapStateToProps
)(MyComponent);
