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
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  handleOnChange(evt) {
    this.setState({ value: evt.target.value });
    this.props.onChange(evt);
  }

  handleOnBlur(value) {
    this.setState({ value });
    this.props.onBlur(value);
  }

  render() {
    return (
      <div className={ classes.combobox }>
        <Textfield
          id={ this.props.id }
          value={ this.state.value }
          onChange={ this.handleOnChange }
          onBlur={ this.handleOnBlur }
          onBlurFormatter={ this.props.onBlurFormatter }
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
  onBlur: noop,
  onBlurFormatter: noop,
};

Combobox.propTypes = {
  id: React.PropTypes.string,
  value: React.PropTypes.string,
  children: React.PropTypes.node,
  onChange: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  onBlurFormatter: React.PropTypes.func,
};
