'use strict';

var React = require('react');
var $ = React.DOM;

var normalizer = require('./utils/normalizer');
var parser = require('./utils/parser');


var InputField = React.createClass({
  displayName: 'InputField',

  normalize: function(text) {
    var type = this.props.type || 'string';
    return normalizer[type](text);
  },
  parse: function(text) {
    var type = this.props.type || 'string';
    return parser[type](text);
  },
  handleChange: function(event) {
    var text = this.normalize(event.target.value);
    this.props.update(this.props.path, text, this.parse(text));
  },
  handleKeyPress: function(event) {
    if (event.keyCode === 13) {
      event.preventDefault();
    }
  },
  render: function() {
    return $.input({
      type      : "text",
      name      : this.props.label,
      value     : this.props.value || '',
      onKeyPress: this.handleKeyPress,
      onChange  : this.handleChange });
  }
});

module.exports = InputField;
