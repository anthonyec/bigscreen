import React from 'react';

import { Textfield } from '../textfield';

import classes from './combobox.css';
import downArrow from './down_arrow.svg';

export class Combobox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };

    this.handleSelectChange = this.handleSelectChange.bind(this);
    this.handleTextfieldChange = this.handleTextfieldChange.bind(this);
  }

  handleTextfieldChange(evt) {
    this.setState({ value: evt.target.value });
  }

  handleSelectChange(evt) {
    this.setState({ value: evt.target.value });
  }

  render() {
    return (
      <div className={ classes.combobox }>
        <Textfield
          id={ this.props.id }
          onChange={ this.handleTextfieldChange }
          value={ this.state.value }
        />
        <div className={ classes.selectContainer }>
          <img className={ classes.arrow } src={ downArrow }/>
          <select
            ref="select"
            value={ this.state.value }
            className={ classes.select }
            onChange={ this.handleSelectChange }
          >
            { this.props.children }
          </select>
          <div className={ classes.focusRing } />
        </div>
      </div>
    );
  }
}

Combobox.propTypes = {
  id: React.PropTypes.string,
  value: React.PropTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
};
