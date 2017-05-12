const React = require('react');
const ReactDOM = require('react-dom');

const element = React.createElement('h1', {}, 'Wow');

ReactDOM.render(
  element,
  document.getElementById('root')
);
