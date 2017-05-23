import React from 'react';

import { Textfield } from '../textfield';

import classes from './combobox.css';

export class Combobox extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      value: props.value,
    };

    this.handleChange = this.handleChange.bind(this)
  }

  handleChange(evt) {
    this.setState({ value: evt.target.value });
  }

  render() {
    return (
      <div className={ classes.combobox }>

        <Textfield value={ this.state.value } />

        <div className={ classes.selectContainer }>
          <select
            ref='select'
            value={ this.state.value }
            className={ classes.select }
            onChange={ this.handleChange }
          >
            { this.props.children }
          </select>
        </div>
      </div>
    );
  }
}
