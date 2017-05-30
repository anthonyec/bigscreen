import React from 'react';

import classes from './textfield.css';

export class Textfield extends React.Component {
  constructor(props) {
    super(props);
    this.state = { value: '' };

    this.handleChange = this.handleChange.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ value: nextProps.value });
  }

  handleChange(evt) {
    this.setState({ value: evt.target.value });
    this.props.onChange(evt);
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
        />
      </div>
    );
  }
}

Textfield.defaultProps = {
  onChange: () => {},
};

Textfield.propTypes = {
  id: React.PropTypes.string,
  onChange: React.PropTypes.func,
};
