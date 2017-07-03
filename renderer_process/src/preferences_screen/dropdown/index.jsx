import React from 'react';

import classes from './dropdown.css';
import downArrow from './down_arrow.svg';

export class Dropdown extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };

    this.handleChange = this.handleChange.bind(this);
  }

  handleChange(evt) {
    this.setState({ value: evt.target.value });
  }

  render() {
    return (
      <div className={ classes.dropdown }>
        <span className={ classes.label }>
          { this.state.value || this.props.defaultValue }
        </span>
        <img className={ classes.arrow } src={ downArrow }/>
        <select
          id={ this.props.id }
          ref="select"
          className={ classes.select }
          onChange={ this.handleChange }
          defaultValue={ this.props.defaultValue }>
          { this.props.children }
        </select>
        <div className={ classes.focusRing } />
      </div>
    );
  }
}

Dropdown.propTypes = {
  id: React.PropTypes.string,
  value: React.PropTypes.string,
  defaultValue: React.PropTypes.string,
  children: React.PropTypes.node,
};
