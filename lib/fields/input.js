'use strict';
var shallowCompare = require('react-addons-shallow-compare');

var React = require('react');
var $ = React.DOM;

var normalizer = require('./utils/normalizer');
var parser = require('./utils/parser');

let x = 0;

var InputField = React.createClass({
    displayName: 'InputField',
    getInitialState: function(){
        return {value: this.props.value, output: this.props.value}
    },
    componentWillReceiveProps: function(nextProps, nextState){
        this.setState({value: nextProps.value})
    },
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
        this.setState({value: text, output: this.parse(text)})
    },
    handleKeyPress: function(event) {
        if (event.keyCode === 13) {
            event.preventDefault();
        }
    },
    update: function(event) {
        this.props.update(this.props.path, this.state.value, this.state.output || null);
    },

    render: function() {
        return $.input({
          type      : "text",
          name      : this.props.label,
          value     : this.state.value || '',
          onKeyPress: this.handleKeyPress,
          onChange  : this.handleChange,
          onBlur : this.update
      });
}
});

module.exports = InputField;
