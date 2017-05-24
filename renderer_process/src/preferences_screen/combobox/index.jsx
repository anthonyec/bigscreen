import React from 'react';

import { Textfield } from '../textfield';

import classes from './combobox.css';

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
          onChange={ this.handleTextfieldChange }
          value={ this.state.value }
        />
        <div className={ classes.selectContainer }>
          <select
            ref="select"
            value={ this.state.value }
            className={ classes.select }
            onChange={ this.handleSelectChange }
          >
            { this.props.children }
          </select>
          <div className={ classes.graphic } />
        </div>
      </div>
    );
  }
}

Combobox.propTypes = {
  value: React.propTypes.string,
  children: React.PropTypes.oneOfType([
    React.PropTypes.array,
    React.PropTypes.object,
  ]),
};
