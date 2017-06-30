import React from 'react';

import noop from 'utils/noop';
import { Textfield } from '../textfield';

import classes from './combobox.css';
import downArrow from './down_arrow.svg';

export class Combobox extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.handleOnChange = this.handleOnChange.bind(this);
  }

  handleOnChange(evt) {
    this.setState({ value: evt.target.value });
    this.props.onChange(evt);
  }

  render() {
    return (
      <div className={ classes.combobox }>
        <Textfield
          id={ this.props.id }
          onChange={ this.handleOnChange }
          value={ this.state.value }
        />
        <div className={ classes.selectContainer }>
          <img className={ classes.arrow } src={ downArrow }/>
          <select
            ref="select"
            value={ this.state.value }
            className={ classes.select }
            onChange={ this.handleOnChange }
          >
            { this.props.children }
          </select>
          <div className={ classes.focusRing } />
        </div>
      </div>
    );
  }
}

Combobox.defaultProps = {
  onChange: noop,
};

Combobox.propTypes = {
  id: React.PropTypes.string,
  value: React.PropTypes.string,
  children: React.PropTypes.node,
  onChange: React.PropTypes.func,
};
