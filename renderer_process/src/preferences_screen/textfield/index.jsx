import React from 'react';

import noop from 'utils/noop';

import classes from './textfield.css';

export class Textfield extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      value: props.value,
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleOnBlur = this.handleOnBlur.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  handleChange(evt) {
    this.setState({ value: evt.target.value });
    this.props.onChange(evt);
  }

  handleOnBlur(evt) {
    // When the onBlur event fires an optional formatter can format and fix the
    // text. Useful for phone numbers, URLs, postcodes etc.
    const value = this.props.onBlurFormatter(evt.target.value) ||
      evt.target.value;

    this.setState({ value });
    this.props.onBlur(value);
  }

  render() {
    return (
      <div className={ classes.textfield }>
        <input
          id={ this.props.id }
          className={ classes.input }
          type="text"
          value={ this.state.value }
          onChange={ this.handleChange }
          onBlur={ this.handleOnBlur }
        />
      </div>
    );
  }
}

Textfield.defaultProps = {
  onChange: noop,
  onBlur: noop,
  onBlurFormatter: noop,
};

Textfield.propTypes = {
  id: React.PropTypes.string,
  value: React.PropTypes.string,
  onChange: React.PropTypes.func,
  onBlur: React.PropTypes.func,
  onBlurFormatter: React.PropTypes.func,
};
