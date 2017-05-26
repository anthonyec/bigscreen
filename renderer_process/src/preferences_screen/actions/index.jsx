import React from 'react';

import classes from './actions.css';

export class Actions extends React.Component {
  render() {
    return (
      <div className={ classes.actions }>
        { this.props.children }
      </div>
    );
  }
}

Actions.propTypes = {
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
};
